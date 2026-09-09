import argparse
import getpass
import json
import mimetypes
import random
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Admin, BusinessSettings, Category, Order, OrderItem, Product
from app.services.auth import hash_password
from app.services.orders import get_business_settings, khr_amount
from app.services.storage import remove_image, upload_bytes

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SEED_MANIFEST = PROJECT_ROOT / "seed_data" / "products.json"
ORDER_SEED_NAMESPACE = uuid.UUID("c63d6981-5d4e-4b48-a551-84369de8cd64")
ORDER_SEED_COUNT = 250


def create_admin(email: str | None) -> None:
    email = (email or input("Admin email: ")).strip().lower()
    password = getpass.getpass("Admin password: ")
    confirmation = getpass.getpass("Confirm password: ")
    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters")
    if password != confirmation:
        raise SystemExit("Passwords do not match")

    with SessionLocal() as db:
        if db.scalar(select(Admin).where(Admin.email == email)):
            raise SystemExit(f"Admin {email} already exists")
        db.add(Admin(email=email, password_hash=hash_password(password), is_admin=True))
        db.commit()
    print(f"Created admin {email}")


def load_manifest() -> dict:
    with SEED_MANIFEST.open(encoding="utf-8") as file:
        return json.load(file)


def seed_products() -> None:
    manifest = load_manifest()
    created = 0
    skipped = 0

    with SessionLocal() as db:
        business = db.get(BusinessSettings, 1)
        if business is None:
            db.add(BusinessSettings(id=1, **manifest["business_settings"]))

        categories: dict[str, Category] = {}
        for data in manifest["categories"]:
            category = db.scalar(select(Category).where(Category.slug == data["slug"]))
            if category is None:
                category = Category(**data)
                db.add(category)
                db.flush()
            categories[category.slug] = category
        db.commit()

        for data in manifest["products"]:
            existing = db.scalar(select(Product).where(Product.sku == data["sku"]))
            if existing:
                skipped += 1
                continue

            image_file = PROJECT_ROOT / "seed_data" / "product_images" / data["image"]
            if not image_file.is_file():
                raise SystemExit(f"Missing seed image: {image_file.relative_to(PROJECT_ROOT)}")
            content_type = mimetypes.guess_type(image_file.name)[0] or "application/octet-stream"
            image_path = None
            try:
                image_path, _ = upload_bytes(
                    image_file.read_bytes(), content_type, image_file.suffix
                )
                product_data = {key: value for key, value in data.items() if key != "image"}
                category_slug = product_data.pop("category_slug")
                db.add(
                    Product(
                        **product_data,
                        category_id=categories[category_slug].id,
                        image_path=image_path,
                    )
                )
                db.commit()
                created += 1
            except Exception:
                db.rollback()
                if image_path:
                    try:
                        remove_image(image_path)
                    except Exception:
                        pass
                raise

    print(f"Seed complete: {created} products created, {skipped} existing SKUs skipped")


def seed_orders() -> None:
    rng = random.Random(20260909)
    statuses = ["pending"] * 88 + ["confirmed"] * 62 + ["completed"] * 75 + ["cancelled"] * 25
    rng.shuffle(statuses)
    channels = ["telegram", "messenger", "telegram,messenger"]
    created = 0
    skipped = 0
    anchor = datetime.now(timezone.utc)

    with SessionLocal() as db:
        products = list(
            db.scalars(
                select(Product).where(Product.is_active.is_(True)).order_by(Product.sku)
            ).all()
        )
        if not products:
            raise SystemExit(
                "No active products found. Run `python -m app.cli seed-products` first."
            )

        business = get_business_settings(db)
        rate = Decimal(business.usd_to_khr_rate)
        existing_numbers = set(
            db.scalars(select(Order.order_number).where(Order.order_number.like("DEMO-ORD-%")))
        )

        for index in range(ORDER_SEED_COUNT):
            number = index + 1
            order_number = f"DEMO-ORD-{number:04d}"
            item_count = rng.randint(1, min(5, len(products)))
            selected_products = rng.sample(products, item_count)
            quantities = [rng.randint(1, 3) for _ in selected_products]
            display_currency = rng.choice(["USD", "KHR"])
            selected_channels = rng.choice(channels)
            created_at = anchor - timedelta(
                days=(index * 89 / max(ORDER_SEED_COUNT - 1, 1)),
                minutes=rng.randint(0, 720),
            )

            if order_number in existing_numbers:
                skipped += 1
                continue

            order = Order(
                id=uuid.uuid5(ORDER_SEED_NAMESPACE, f"order-{number}"),
                public_token=uuid.uuid5(ORDER_SEED_NAMESPACE, f"public-{number}"),
                order_number=order_number,
                status=statuses[index],
                selected_channels=selected_channels,
                display_currency=display_currency,
                exchange_rate=rate,
                total_usd_cents=0,
                total_khr=0,
                inventory_deducted=False,
                created_at=created_at,
                updated_at=created_at,
            )

            for product, quantity in zip(selected_products, quantities, strict=True):
                line_usd = product.price_usd_cents * quantity
                unit_khr = khr_amount(product.price_usd_cents, rate)
                line_khr = khr_amount(line_usd, rate)
                order.items.append(
                    OrderItem(
                        product_id=product.id,
                        product_name=product.name,
                        product_sku=product.sku,
                        image_path=product.image_path,
                        quantity=quantity,
                        unit_price_usd_cents=product.price_usd_cents,
                        line_total_usd_cents=line_usd,
                        unit_price_khr=unit_khr,
                        line_total_khr=line_khr,
                    )
                )
                order.total_usd_cents += line_usd
                order.total_khr += line_khr

            db.add(order)
            created += 1

        db.commit()

    print(f"Order seed complete: {created} orders created, {skipped} existing demo orders skipped")


def main() -> None:
    parser = argparse.ArgumentParser(description="Administrative CLI")
    subcommands = parser.add_subparsers(dest="command", required=True)
    admin_parser = subcommands.add_parser("create-admin", help="Create an admin account")
    admin_parser.add_argument("--email")
    subcommands.add_parser(
        "seed-products", help="Seed 250 demo products, categories, settings, and images"
    )
    subcommands.add_parser("seed-orders", help="Seed 250 varied demo orders from active products")
    args = parser.parse_args()

    if args.command == "create-admin":
        create_admin(args.email)
    elif args.command == "seed-products":
        seed_products()
    elif args.command == "seed-orders":
        seed_orders()


if __name__ == "__main__":
    main()
