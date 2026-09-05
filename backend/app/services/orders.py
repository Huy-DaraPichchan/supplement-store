import html
import uuid
import urllib.parse
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.models import BusinessSettings, Order, OrderItem, Product
from app.schemas.order import Channel, Currency, OrderCreate
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

    if payload.display_currency == Currency.KHR and not business.usd_to_khr_rate:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="KHR checkout is unavailable until an exchange rate is configured",
        )

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
        total_khr=0 if business.usd_to_khr_rate else None,
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
        unit_khr = (
            khr_amount(product.price_usd_cents, business.usd_to_khr_rate)
            if business.usd_to_khr_rate
            else None
        )
        line_khr = (
            khr_amount(line_usd, business.usd_to_khr_rate)
            if business.usd_to_khr_rate
            else None
        )
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
        if order.total_khr is not None and line_khr is not None:
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


def format_money(order: Order, usd_cents: int, khr: int | None) -> str:
    if order.display_currency == Currency.KHR.value and khr is not None:
        return f"៛{khr:,}"
    return f"${usd_cents / 100:,.2f}"


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
            f"Total: {format_money(order, order.total_usd_cents, order.total_khr)}",
            f"Order details: {public_order_url}",
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
    return f"{base_url}/orders/{order.public_token}/share"


def order_share_html(order: Order, business: BusinessSettings, order_url: str) -> str:
    description = ", ".join(f"{item.product_name} ×{item.quantity}" for item in order.items)
    total = format_money(order, order.total_usd_cents, order.total_khr)
    title = f"{order.order_number} — {total}"
    first_image_item = next((item for item in order.items if item.image_path), None)
    image = public_url(first_image_item.image_path) if first_image_item else business.logo_url
    image_alt = (
        f"{first_image_item.product_name} in {order.order_number}"
        if first_image_item
        else f"{business.company_name} logo"
    )
    image_meta = ""
    if image:
        image_meta = (
            f'<meta property="og:image" content="{html.escape(image, quote=True)}">'
            f'<meta property="og:image:alt" content="{html.escape(image_alt, quote=True)}">'
        )
    rows = "".join(
        '<li class="item">'
        + (
            '<div class="thumb"><img src="'
            f'{html.escape(public_url(item.image_path) or "", quote=True)}" '
            f'alt="{html.escape(item.product_name, quote=True)}"></div>'
            if item.image_path
            else '<div class="thumb placeholder" aria-hidden="true">No image</div>'
        )
        + '<div class="item-copy">'
        + f"<h2>{html.escape(item.product_name)}</h2>"
        + f'<p class="sku">SKU: {html.escape(item.product_sku)}</p>'
        + '<div class="line">'
        + f"<span>Quantity: {item.quantity}</span>"
        + "<strong>"
        + html.escape(format_money(order, item.line_total_usd_cents, item.line_total_khr))
        + "</strong></div></div></li>"
        for item in order.items
    )
    escaped_title = html.escape(title, quote=True)
    escaped_description = html.escape(description, quote=True)
    escaped_order_url = html.escape(order_url, quote=True)
    escaped_status = html.escape(order.status.capitalize())
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="googlebot" content="noindex, nofollow, noarchive">
<meta property="og:type" content="website"><meta property="og:title" content="{escaped_title}">
<meta property="og:description" content="{escaped_description}">
<meta property="og:url" content="{escaped_order_url}">{image_meta}
<style>
:root{{color-scheme:light dark;font-family:system-ui,-apple-system,sans-serif;background:#f7f2f6;color:#241d23}}
*{{box-sizing:border-box}}body{{margin:0;padding:2rem 1rem}}main{{max-width:680px;margin:auto}}
.header,.summary{{border:1px solid #ddcfda;border-radius:.7rem;background:#fff;padding:1.25rem}}
.header{{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}}
h1{{margin:0;font:600 1.75rem ui-serif,Georgia,serif}}.eyebrow,.sku{{color:#665d65}}
.eyebrow{{margin:0 0 .25rem}}.status{{border-radius:999px;background:#fff0e4;color:#8a641f;padding:.4rem .7rem;font-weight:700}}
ul{{list-style:none;margin:1rem 0;padding:0;display:grid;gap:.75rem}}.item{{display:flex;gap:1rem;border:1px solid #ddcfda;border-radius:.7rem;background:#fff;padding:1rem}}
.thumb{{width:88px;height:88px;flex:none;border-radius:.55rem;background:#f0e8ee;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#665d65;font-size:.75rem}}
.thumb img{{width:100%;height:100%;object-fit:contain}}.item-copy{{min-width:0;flex:1}}h2{{margin:0;font-size:1rem}}.sku{{margin:.3rem 0 .9rem;font-size:.875rem}}
.line,.summary{{display:flex;align-items:center;justify-content:space-between;gap:1rem}}.summary{{font-size:1.125rem}}.summary strong{{font-size:1.3rem}}
@media(max-width:440px){{body{{padding:1rem}}.header{{display:block}}.status{{display:inline-block;margin-top:1rem}}.thumb{{width:72px;height:72px}}.line{{align-items:flex-start;flex-direction:column;gap:.25rem}}}}
@media(prefers-color-scheme:dark){{:root{{background:#120e11;color:#f8f2f6}}.header,.item,.summary{{background:#211a20;border-color:#493843}}.thumb{{background:#362a32}}.eyebrow,.sku,.placeholder{{color:#c9bdc6}}.status{{background:#3b2a20;color:#d2a84a}}}}
</style>
</head><body><main>
<header class="header"><div><p class="eyebrow">Order details</p><h1>{html.escape(order.order_number)}</h1></div><span class="status">{escaped_status}</span></header>
<ul>{rows}</ul><div class="summary"><span>Total</span><strong>{html.escape(total)}</strong></div>
</main></body></html>"""


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
