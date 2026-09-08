import uuid
import urllib.parse
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.models import BusinessSettings, Order, OrderItem, Product
from app.schemas.order import Channel, Currency, OrderCreate, OrderResponse
from app.services.storage import public_url


def get_business_settings(db: Session) -> BusinessSettings:
    settings = db.get(BusinessSettings, 1)
    if settings is None:
        settings = BusinessSettings(id=1)
        db.add(settings)
        db.flush()
    return settings


def khr_amount(usd_cents: int, rate: Decimal) -> int:
    return int((Decimal(usd_cents) * rate / Decimal(100)).quantize(Decimal("1"), ROUND_HALF_UP))


def create_order(db: Session, payload: OrderCreate) -> tuple[Order, BusinessSettings]:
    ids = [item.product_id for item in payload.items]
    products = db.scalars(select(Product).where(Product.id.in_(ids))).all()
    by_id = {product.id: product for product in products}
    business = get_business_settings(db)

    requested_channels = set(payload.channels)
    if Channel.TELEGRAM in requested_channels and (
        not business.telegram_enabled or not business.telegram_username
    ):
        raise HTTPException(status_code=422, detail="Telegram checkout is not configured")
    if Channel.MESSENGER in requested_channels and (
        not business.messenger_enabled or not business.messenger_url
    ):
        raise HTTPException(status_code=422, detail="Messenger checkout is not configured")

    order_id = uuid.uuid4()
    order = Order(
        id=order_id,
        order_number="pending",
        status="pending",
        selected_channels=",".join(channel.value for channel in payload.channels),
        display_currency=payload.display_currency.value,
        exchange_rate=business.usd_to_khr_rate,
        total_usd_cents=0,
        total_khr=0,
    )
    order.order_number = f"ORD-{order_id.hex[:8].upper()}"

    for requested in payload.items:
        product = by_id.get(requested.product_id)
        if product is None or not product.is_active:
            raise HTTPException(status_code=422, detail=f"product {requested.product_id} is unavailable")
        if product.stock < requested.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"insufficient stock for {product.name}",
            )
        line_usd = product.price_usd_cents * requested.quantity
        unit_khr = khr_amount(product.price_usd_cents, business.usd_to_khr_rate)
        line_khr = khr_amount(line_usd, business.usd_to_khr_rate)
        order.items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                image_path=product.image_path,
                quantity=requested.quantity,
                unit_price_usd_cents=product.price_usd_cents,
                line_total_usd_cents=line_usd,
                unit_price_khr=unit_khr,
                line_total_khr=line_khr,
            )
        )
        order.total_usd_cents += line_usd
        order.total_khr += line_khr

    db.add(order)
    db.commit()
    return get_order_by_token(db, order.public_token), business


def get_order_by_token(db: Session, token) -> Order:
    order = db.scalar(
        select(Order).options(selectinload(Order.items)).where(Order.public_token == token)
    )
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order not found")
    return order


def get_order_by_id(db: Session, order_id, *, for_update: bool = False) -> Order:
    statement = select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    if for_update:
        statement = statement.with_for_update()
    order = db.scalar(statement)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order not found")
    return order


def order_response(order: Order) -> OrderResponse:
    response = OrderResponse.model_validate(order)
    response.items = [
        item.model_copy(update={"image_url": public_url(item.image_path)})
        for item in response.items
    ]
    return response


def format_money(order: Order, usd_cents: int, khr: int) -> str:
    if order.display_currency == Currency.KHR.value:
        return f"៛{khr:,}"
    return f"${usd_cents / 100:,.2f}"


def format_order_total(order: Order) -> str:
    usd = f"${order.total_usd_cents / 100:,.2f}"
    khr = f"៛{order.total_khr:,}"
    if order.display_currency == Currency.KHR.value:
        return f"{khr} ({usd})"
    return f"{usd} ({khr})"


def prepared_message(order: Order, public_order_url: str) -> str:
    lines = [f"New Order {order.order_number}", ""]
    for item in order.items:
        lines.append(
            f"{item.product_name} × {item.quantity} — "
            f"{format_money(order, item.line_total_usd_cents, item.line_total_khr)}"
        )
    lines.extend(
        [
            "",
            f"Total: {format_order_total(order)}",
            "Order details:",
            public_order_url,
        ]
    )
    return "\n".join(lines)


def checkout_links(
    order: Order, business: BusinessSettings
) -> tuple[Channel, str, str | None, str, str]:
    order_url = public_order_url(order)
    message = prepared_message(order, order_url)
    encoded_message = urllib.parse.quote(message, safe="")
    channels = order.selected_channels.split(",")

    urls: dict[str, str] = {}
    if "telegram" in channels and business.telegram_username:
        username = business.telegram_username.lstrip("@").strip()
        urls["telegram"] = f"https://t.me/{username}?text={encoded_message}"
    if "messenger" in channels and business.messenger_url:
        urls["messenger"] = business.messenger_url

    preferred = Channel.TELEGRAM if "telegram" in urls else Channel.MESSENGER
    fallback = urls.get("messenger") if preferred == Channel.TELEGRAM else None
    return preferred, urls[preferred.value], fallback, order_url, message


def public_order_url(order: Order) -> str:
    base_url = get_settings().public_base_url.rstrip("/")
    return f"{base_url}/orders/{order.public_token}"


ALLOWED_TRANSITIONS = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


def update_order_status(db: Session, order_id, target: str) -> Order:
    order = get_order_by_id(db, order_id, for_update=True)
    if order.status == target:
        return order
    if target not in ALLOWED_TRANSITIONS[order.status]:
        raise HTTPException(status_code=409, detail=f"cannot change {order.status} order to {target}")

    product_ids = [item.product_id for item in order.items if item.product_id]
    products = db.scalars(
        select(Product).where(Product.id.in_(product_ids)).with_for_update()
    ).all()
    by_id = {product.id: product for product in products}

    if target == "confirmed" and not order.inventory_deducted:
        for item in order.items:
            product = by_id.get(item.product_id)
            if product is None or product.stock < item.quantity:
                raise HTTPException(status_code=409, detail=f"insufficient stock for {item.product_name}")
        for item in order.items:
            by_id[item.product_id].stock -= item.quantity
        order.inventory_deducted = True

    if target == "cancelled" and order.inventory_deducted:
        for item in order.items:
            product = by_id.get(item.product_id)
            if product is not None:
                product.stock += item.quantity
        order.inventory_deducted = False

    order.status = target
    db.commit()
    return get_order_by_id(db, order.id)
