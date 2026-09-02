import argparse
import getpass
import json
import mimetypes
from pathlib import Path

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Admin, BusinessSettings, Category, Product
from app.services.auth import hash_password
from app.services.storage import remove_image, upload_bytes

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SEED_MANIFEST = PROJECT_ROOT / "seed_data" / "products.json"


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


def seed() -> None:
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


def main() -> None:
    parser = argparse.ArgumentParser(description="Administrative CLI")
    subcommands = parser.add_subparsers(dest="command", required=True)
    admin_parser = subcommands.add_parser("create-admin", help="Create an admin account")
    admin_parser.add_argument("--email")
    subcommands.add_parser("seed", help="Seed demo settings, categories, products, and images")
    args = parser.parse_args()

    if args.command == "create-admin":
        create_admin(args.email)
    elif args.command == "seed":
        seed()


if __name__ == "__main__":
    main()
