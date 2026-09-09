# Supplement Store API

A simple FastAPI backend for a supplement storefront. Customers browse products and create
orders without accounts. Admins log in to manage the catalog, images, stock, business settings,
and order status.

## Start here

Choose the guide that matches what you are doing:

| Goal | Read this |
| --- | --- |
| Run the backend locally | [Local Docker setup](docs/DOCKER.md#local-sqlite-quick-start) |
| Deploy with Supabase PostgreSQL | [Hosted Docker setup](docs/DOCKER.md#supabase-postgresql-hosting) |
| Connect a frontend to the API | [API guide](docs/API.md) |
| Look up a specific endpoint | [Endpoint summary](docs/API.md#endpoint-summary) |
| Fix a setup problem | [Docker troubleshooting](docs/DOCKER.md#troubleshooting) |

## Fastest local setup

Local Docker uses SQLite for data and Supabase Storage for product images.

```bash
cp .env.example .env
```

Add your Supabase project URL and server-side Storage key to `.env`, then run:

```bash
docker compose up --build -d
docker compose run --rm api python -m app.cli create-admin --email admin@example.com
docker compose run --rm api python -m app.cli seed-products
docker compose run --rm api python -m app.cli seed-orders
```

Open:

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

For explanations, environment variables, logs, rebuilds, data reset, and hosted deployment, use
the [Docker guide](docs/DOCKER.md).

## How the application works

```text
Frontend cart
     │
     ▼
POST /orders ──> saved pending order ──> Telegram/Messenger handoff
                        │
                        ▼
               admin confirms order
                        │
                        ▼
                  stock is deducted
```

- The frontend keeps the guest cart locally.
- The backend recalculates prices and validates stock during checkout.
- Payment is handled manually outside the website.
- Product images are stored in Supabase Storage.
- SQLite is available for local development; Supabase PostgreSQL is used for hosting.

See the [API guide](docs/API.md) for the complete customer and admin workflows.

## Develop without Docker

```bash
uv sync
uv run alembic upgrade head
uv run python -m app.cli create-admin --email admin@example.com
uv run python -m app.cli seed-products
uv run python -m app.cli seed-orders
uv run uvicorn app.main:app --reload
```

The first seed command ensures the 250-product demo catalog exists and uploads product images.
Run `seed-orders` afterward to ensure 250 varied historical orders exist. Both are idempotent, and
the order seed does not deduct or restore product stock.

Run tests with:

```bash
uv run pytest
```

## Technology

- FastAPI, Pydantic, SQLAlchemy 2.x, and Alembic
- SQLite locally and Supabase PostgreSQL when hosted
- Supabase Storage for product images
- JWT authentication for admins only
- Docker Compose for portable setup

Redis, customer accounts, online payments, and automatic chat sending are intentionally outside
the current scope.
