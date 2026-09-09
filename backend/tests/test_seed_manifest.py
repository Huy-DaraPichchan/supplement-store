import json
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
SEED_MANIFEST = BACKEND_ROOT / "seed_data" / "products.json"
PRODUCT_IMAGES = BACKEND_ROOT / "seed_data" / "product_images"


def test_seed_catalog_has_250_valid_unique_products():
    manifest = json.loads(SEED_MANIFEST.read_text(encoding="utf-8"))
    products = manifest["products"]
    category_slugs = {category["slug"] for category in manifest["categories"]}

    assert len(products) == 250
    assert len({product["name"] for product in products}) == 250
    assert len({product["slug"] for product in products}) == 250
    assert len({product["sku"] for product in products}) == 250
    assert {product["sku"] for product in products} == {
        f"DEMO-{number:03d}" for number in range(1, 251)
    }
    assert all(product["category_slug"] in category_slugs for product in products)
    assert all((PRODUCT_IMAGES / product["image"]).is_file() for product in products)
