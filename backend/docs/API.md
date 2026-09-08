# API Guide

Use this guide when building the customer storefront or admin dashboard. For installation,
seeding, Docker, or deployment, use the [Docker guide](DOCKER.md). For a short project overview,
return to the [README](../README.md).

## Quick navigation

- [Frontend integration flow](#frontend-integration-flow)
- [Core behavior](#core-behavior)
- [Public endpoints](#public-endpoints)
- [Admin authentication](#admin-authentication)
- [Admin categories](#admin-categories)
- [Admin products](#admin-products)
- [Admin business settings](#admin-business-settings)
- [Admin orders](#admin-orders)
- [Endpoint summary](#endpoint-summary)

The interactive OpenAPI documentation is available while the server is running:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

Examples use this shell variable:

```bash
BASE_URL=http://localhost:8000
```

## Frontend integration flow

The customer frontend needs only four steps:

1. Call `GET /settings` to load the business identity, exchange rate, and enabled chat channels.
2. Call `GET /categories` and `GET /products` to build the catalog.
3. Keep selected product IDs and quantities in the browser's local cart state.
4. Send the cart to `POST /orders`, then open the returned `preferred_url`.

The admin dashboard follows this flow:

1. Log in through `POST /admin/login` and save the returned bearer token securely.
2. Include `Authorization: Bearer <token>` on all remaining `/admin/*` requests.
3. Manage products, categories, settings, and order status through their admin endpoints.

The frontend never submits prices, totals, exchange rates, or stock changes. The backend owns
those calculations.

## Core behavior

- Customers never register or authenticate.
- The frontend owns the cart and submits product IDs and quantities at checkout.
- Prices are stored in USD cents. KHR values use the admin-managed USD-to-KHR rate.
- The backend always recalculates prices and checks stock; it does not trust cart totals.
- Creating an order does not reserve stock. Stock is deducted when an admin confirms it.
- Orders snapshot product names, SKUs, images, prices, currency, and exchange rate.
- Public order links use an unguessable token and contain no customer personal information.
- Admin endpoints require a JWT bearer token, except `/admin/login`.

JSON requests use `Content-Type: application/json`. Image uploads use `multipart/form-data`.

## Errors

FastAPI errors use this shape:

```json
{
  "detail": "human-readable error"
}
```

Common status codes:

| Code | Meaning |
| --- | --- |
| `200` | Successful read or update |
| `201` | Record created |
| `204` | Record deleted; response has no body |
| `401` | Missing, invalid, or expired admin token |
| `404` | Record or public order token not found |
| `409` | Duplicate data, invalid order transition, or insufficient stock |
| `422` | Invalid input or unavailable checkout configuration |

## Endpoint summary

### Public storefront

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Verify API and database availability |
| `GET` | `/settings` | Load business, currency, and chat settings |
| `GET` | `/categories` | List active categories |
| `GET` | `/products` | List and filter active products |
| `GET` | `/products/{slug}` | Read one active product |
| `POST` | `/orders` | Create a guest order and chat handoff |
| `GET` | `/orders/{public_token}` | Read a public order snapshot |
| `GET` | `/orders/{public_token}/share` | Redirect legacy links to the storefront order page |

### Admin dashboard

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/admin/login` | Obtain an admin access token |
| `GET`, `POST` | `/admin/categories` | List or create categories |
| `PATCH`, `DELETE` | `/admin/categories/{category_id}` | Update or delete a category |
| `GET`, `POST` | `/admin/products` | List or create products |
| `GET`, `PATCH`, `DELETE` | `/admin/products/{product_id}` | Read, update, or delete a product |
| `POST` | `/admin/products/{product_id}/image` | Upload or replace a product image |
| `GET`, `PATCH` | `/admin/settings` | Read or update business settings |
| `GET` | `/admin/orders` | List and filter orders |
| `GET` | `/admin/orders/{order_id}` | Read one internal order |
| `PATCH` | `/admin/orders/{order_id}/status` | Confirm, complete, or cancel an order |

## Public endpoints

### Health check

```http
GET /health
```

Checks that the API can execute a database query.

```bash
curl "$BASE_URL/health"
```

```json
{"status":"ok"}
```

### Business settings

```http
GET /settings
```

Returns storefront identity, enabled chat channels, and the current exchange rate. USD is always
the default display currency. The exchange rate defaults to 4000 KHR per USD and cannot be null.

```bash
curl "$BASE_URL/settings"
```

```json
{
  "company_name": "Demo Supplement Store",
  "company_summary": "A demo catalog for testing the storefront.",
  "address": "Phnom Penh",
  "phone": "+855 12 345 678",
  "email": "sales@example.com",
  "logo_url": null,
  "telegram_username": "seller_username",
  "messenger_url": "https://m.me/example.page",
  "telegram_enabled": true,
  "messenger_enabled": true,
  "usd_to_khr_rate": "4100.0000",
  "default_currency": "USD"
}
```

### Categories

```http
GET /categories
```

Returns active categories ordered by name.

```bash
curl "$BASE_URL/categories"
```

### Product list

```http
GET /products?category={category_slug}&limit=50&offset=0
```

Only active products are returned. `category` is optional. `limit` accepts `1–100`; `offset` must
be zero or greater.

```bash
curl "$BASE_URL/products?category=vitamins-supplements&limit=20&offset=0"
```

```json
[
  {
    "id": "cf4d79f6-8692-43a6-8e45-79984264e46b",
    "category_id": "6373fb03-2114-4aa2-b67f-0bda1394595a",
    "name": "Vitamin C",
    "slug": "vitamin-c",
    "sku": "VIT-C",
    "description": "Daily vitamin C",
    "price_usd_cents": 1250,
    "price_khr": 51250,
    "stock": 10,
    "image_path": "products/550e8400-e29b-41d4-a716-446655440000.jpg",
    "image_url": "https://PROJECT.supabase.co/storage/v1/object/public/product-images/products/550e8400-e29b-41d4-a716-446655440000.jpg",
    "is_active": true,
    "created_at": "2026-09-01T10:00:00Z",
    "updated_at": "2026-09-01T10:00:00Z"
  }
]
```

Money rules:

- `price_usd_cents=1250` means `$12.50`.
- `price_khr` is a whole-riel display value calculated from the current rate.
- The frontend should format values; it must not send calculated prices during checkout.

### Product detail

```http
GET /products/{slug}
```

```bash
curl "$BASE_URL/products/vitamin-c"
```

Returns one active product in the same shape as the list response. Missing or inactive products
return `404`.

### Create an order

```http
POST /orders
```

Accepted currencies are `USD` and `KHR`. Accepted channels are `telegram` and `messenger`.
Products and channels must be unique within the request.

```bash
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"product_id": "cf4d79f6-8692-43a6-8e45-79984264e46b", "quantity": 2}
    ],
    "display_currency": "USD",
    "channels": ["telegram", "messenger"]
  }'
```

```json
{
  "id": "720331b2-5d86-4de3-b4e0-674ec6d44f88",
  "order_number": "ORD-720331B2",
  "public_token": "c005f55f-9dfd-4d2f-9475-6597600c9da7",
  "status": "pending",
  "selected_channels": "telegram,messenger",
  "display_currency": "USD",
  "exchange_rate": "4100.0000",
  "total_usd_cents": 2500,
  "total_khr": 102500,
  "created_at": "2026-09-01T10:30:00Z",
  "items": [
    {
      "product_id": "cf4d79f6-8692-43a6-8e45-79984264e46b",
      "product_name": "Vitamin C",
      "product_sku": "VIT-C",
      "image_path": "products/example.jpg",
      "image_url": "https://PROJECT.supabase.co/storage/v1/object/public/product-images/products/example.jpg",
      "quantity": 2,
      "unit_price_usd_cents": 1250,
      "line_total_usd_cents": 2500,
      "unit_price_khr": 51250,
      "line_total_khr": 102500
    }
  ],
  "public_url": "https://store.example.com/orders/c005f55f-9dfd-4d2f-9475-6597600c9da7",
  "prepared_message": "New Order ORD-720331B2\n\nVitamin C × 2 — $25.00\n\nTotal: $25.00 (៛102,500)\nOrder details:\nhttps://store.example.com/orders/...",
  "preferred_channel": "telegram",
  "preferred_url": "https://t.me/seller_username?text=New%20Order...",
  "fallback_url": "https://m.me/example.page"
}
```

The order is rejected when a requested product is inactive, missing, or does not have enough
stock. Every order snapshots both USD and KHR totals using the current positive exchange rate.
A selected channel must also be enabled and have its seller address configured.

When both channels are selected, Telegram is preferred and Messenger is returned as fallback.
Both platforms require the customer to perform their final Send confirmation.

### Public order JSON

```http
GET /orders/{public_token}
```

```bash
curl "$BASE_URL/orders/c005f55f-9dfd-4d2f-9475-6597600c9da7"
```

Returns the saved order snapshot. The token is intentionally hard to guess but should still be
treated as private.

### Legacy share URL

```http
GET /orders/{public_token}/share
```

Redirects previously sent links to the storefront order page. New checkout messages link directly
to `{PUBLIC_BASE_URL}/orders/{public_token}`. The frontend renders the order and its Open Graph
metadata. In production, `PUBLIC_BASE_URL` must be the publicly reachable HTTPS frontend address
so Telegram can recognize and open the link.

## Admin authentication

Create the first admin using the [Docker setup guide](DOCKER.md#local-sqlite-quick-start), then
log in:

```http
POST /admin/login
```

```bash
curl -X POST "$BASE_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

Use the token on every other admin request:

```bash
TOKEN=replace-with-access-token
curl -H "Authorization: Bearer $TOKEN" "$BASE_URL/admin/products"
```

Tokens expire according to `ACCESS_TOKEN_EXPIRE_MINUTES`.

## Admin categories

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/admin/categories` | List active and inactive categories |
| `POST` | `/admin/categories` | Create a category |
| `PATCH` | `/admin/categories/{category_id}` | Update supplied fields |
| `DELETE` | `/admin/categories/{category_id}` | Delete a category and detach its products |

Create example:

```bash
curl -X POST "$BASE_URL/admin/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Vitamins","slug":"vitamins","is_active":true}'
```

Slugs contain lowercase letters, numbers, and single hyphens between segments.

## Admin products

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/admin/products?search={text}&limit=100` | List all products; optionally search name/SKU |
| `POST` | `/admin/products` | Create a product without an image |
| `GET` | `/admin/products/{product_id}` | Read one product |
| `PATCH` | `/admin/products/{product_id}` | Update supplied fields, including stock |
| `DELETE` | `/admin/products/{product_id}` | Delete product and attempt Storage cleanup |
| `POST` | `/admin/products/{product_id}/image` | Upload or replace the product image |

Create example:

```bash
curl -X POST "$BASE_URL/admin/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "6373fb03-2114-4aa2-b67f-0bda1394595a",
    "name": "Vitamin C",
    "slug": "vitamin-c",
    "sku": "VIT-C",
    "description": "Daily vitamin C",
    "price_usd_cents": 1250,
    "stock": 10,
    "is_active": true
  }'
```

Update only the supplied fields:

```bash
curl -X PATCH "$BASE_URL/admin/products/PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock":25,"price_usd_cents":1399}'
```

Upload a JPEG, PNG, or WebP image up to 5 MB:

```bash
curl -X POST "$BASE_URL/admin/products/PRODUCT_ID/image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@seed_data/product_images/bottle.jpg"
```

```json
{
  "image_path": "products/550e8400-e29b-41d4-a716-446655440000.jpg",
  "public_url": "https://PROJECT.supabase.co/storage/v1/object/public/product-images/products/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

## Admin business settings

```http
GET /admin/settings
PATCH /admin/settings
```

The patch endpoint updates only supplied fields. A channel cannot be enabled without its address,
and the exchange rate must remain a positive number.

```bash
curl -X PATCH "$BASE_URL/admin/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Example Trading",
    "usd_to_khr_rate": 4100,
    "telegram_username": "example_seller",
    "telegram_enabled": true,
    "messenger_url": "https://m.me/example.page",
    "messenger_enabled": true
  }'
```

Changing the exchange rate affects new display calculations and new orders only. Existing orders
keep their snapshotted rate and values.

## Admin orders

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/admin/orders?status={status}&limit=100` | List newest orders with optional status filter |
| `GET` | `/admin/orders/{order_id}` | Read an order by internal UUID |
| `PATCH` | `/admin/orders/{order_id}/status` | Apply a valid status transition |

Order states:

```text
pending ──> confirmed ──> completed
   │             │
   └─────────────┴──────> cancelled
```

- `pending → confirmed`: checks stock again and deducts it atomically.
- `pending → cancelled`: cancels without changing stock.
- `confirmed → completed`: completes the order without another stock change.
- `confirmed → cancelled`: restores previously deducted stock exactly once.
- `completed` and `cancelled` are terminal.
- Repeating the current status is idempotent.

```bash
curl -X PATCH "$BASE_URL/admin/orders/ORDER_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
```

Allowed values are `pending`, `confirmed`, `completed`, and `cancelled`, subject to the transition
rules above.
