# Docker Guide

Use this guide to install, run, seed, operate, and deploy the backend. To consume the endpoints
from a frontend, use the [API guide](API.md). For a short project overview, return to the
[README](../README.md).

## Choose a workflow

| What you need | Database | Command |
| --- | --- | --- |
| Frontend development on your machine | SQLite volume | `docker compose up --build -d` |
| Shared or hosted environment | Supabase PostgreSQL | `docker compose -f compose.yaml -f compose.supabase.yaml up --build -d` |

The same Docker image supports two database modes:

| Mode | Database | Images | Intended use |
| --- | --- | --- | --- |
| Local | SQLite in a named Docker volume | Supabase Storage | Frontend development and demos |
| Hosted | Supabase PostgreSQL session pooler | Supabase Storage | Deployment and shared environments |

Both modes keep product images in Supabase Storage. The container automatically runs
`alembic upgrade head` before its command. Demo seeding and admin creation are always explicit.

## Quick navigation

- [Local SQLite quick start](#local-sqlite-quick-start)
- [Local operations](#local-operations)
- [Reset local data](#reset-local-data)
- [Supabase PostgreSQL hosting](#supabase-postgresql-hosting)
- [Build and run without Compose](#build-and-run-without-compose)
- [Migrations](#migrations)
- [Configuration reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker Engine with Docker Compose v2
- A Supabase project
- A public Storage bucket named `product-images`
- A server-side Supabase secret/service key

Copy the environment template:

```bash
cp .env.example .env
```

Configure at least:

```env
SECRET_KEY=replace-with-a-long-random-value
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=your-server-side-key
SUPABASE_STORAGE_BUCKET=product-images
PUBLIC_BASE_URL=http://localhost:8000
```

`SUPABASE_URL` must be the project root without `/rest/v1`. Never expose
`SUPABASE_SECRET_KEY` to frontend code or commit `.env`.

## Local SQLite quick start

This is the recommended workflow for a frontend developer. The default Compose file uses SQLite
and stores the database in the `api_data` named volume.

Build and start:

```bash
docker compose up --build
```

Run in the background instead:

```bash
docker compose up --build -d
```

Confirm that it started:

```bash
docker compose ps
curl http://localhost:8000/health
```

The API is available at:

- `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

Create the first admin:

```bash
docker compose run --rm api python -m app.cli create-admin --email admin@example.com
```

The command prompts for the password twice. It applies migrations automatically before running.

Seed the demo catalog and upload its images to Supabase Storage:

```bash
docker compose run --rm api python -m app.cli seed
```

The seed is idempotent by SKU. Reruns create missing products and skip existing products without
overwriting dashboard changes. A new empty SQLite volume will upload new image objects when seeded.

At this point the backend is ready for frontend development. Use the [API guide](API.md) for the
customer and admin request flows.

## Local operations

Useful commands:

```bash
# View logs
docker compose logs -f api

# Check container status and health
docker compose ps

# Stop while retaining SQLite data
docker compose down

# Rebuild after source or dependency changes
docker compose up --build -d

# Open a shell in a running container
docker compose exec api sh
```

## Reset local data

The following command permanently deletes the local SQLite volume, including local admins,
products, and orders:

```bash
docker compose down -v
```

Supabase Storage images are not deleted by removing the local Docker volume.

## Supabase PostgreSQL hosting

Set `DATABASE_URL` in `.env` to the Supabase **session pooler** connection string:

```env
DATABASE_URL=postgresql+psycopg://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

Use the exact value from Supabase **Connect → ORMs → SQLAlchemy**. The pooler is preferable on
networks that cannot reach Supabase's direct IPv6 database address.

Start using the Compose override:

```bash
docker compose -f compose.yaml -f compose.supabase.yaml up --build -d
```

The override sets `DATABASE_BACKEND=postgresql`. On startup, Alembic applies pending migrations to
the configured Supabase database.

Create an admin in Supabase PostgreSQL:

```bash
docker compose -f compose.yaml -f compose.supabase.yaml run --rm api \
  python -m app.cli create-admin --email admin@example.com
```

Seed Supabase PostgreSQL and Storage:

```bash
docker compose -f compose.yaml -f compose.supabase.yaml run --rm api \
  python -m app.cli seed
```

The hosted and local databases are independent even though both use the same Storage bucket.

## Build and run without Compose

Build the image:

```bash
docker build -t supplement-store-api .
```

Run with Supabase PostgreSQL:

```bash
docker run --rm -p 8000:8000 \
  --env-file .env \
  -e DATABASE_BACKEND=postgresql \
  supplement-store-api
```

Run with persistent SQLite:

```bash
docker volume create supplement-store-data

docker run --rm -p 8000:8000 \
  --env-file .env \
  -e DATABASE_BACKEND=sqlite \
  -e SQLITE_PATH=/data/ecommerce.db \
  -v supplement-store-data:/data \
  supplement-store-api
```

## Migrations

Migrations run automatically because `RUN_MIGRATIONS` defaults to `true`. To run them explicitly:

```bash
docker compose run --rm api alembic upgrade head
```

To disable automatic migrations for a multi-replica deployment, set:

```env
RUN_MIGRATIONS=false
```

Then run `alembic upgrade head` once as a deployment job before starting the replicas.

## Tests

The production image intentionally excludes development dependencies and tests. Run them from the
project environment:

```bash
uv sync
uv run pytest
```

Tests use an in-memory SQLite database and mock Supabase Storage.

## Configuration reference

| Variable | Required | Purpose |
| --- | --- | --- |
| `APP_NAME` | No | OpenAPI application title |
| `APP_ENV` | No | Environment label |
| `DEBUG` | No | FastAPI debug mode |
| `PUBLIC_BASE_URL` | Yes for sharing | Base address embedded in public order links |
| `DATABASE_BACKEND` | Yes | `sqlite` or `postgresql`; Compose supplies it |
| `SQLITE_PATH` | SQLite only | SQLite file path; Docker uses `/data/ecommerce.db` |
| `DATABASE_URL` | PostgreSQL only | SQLAlchemy/Supabase pooler connection string |
| `SECRET_KEY` | Yes | Signs admin JWT access tokens |
| `ALGORITHM` | No | JWT algorithm; defaults to `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Admin token lifetime |
| `SUPABASE_URL` | Yes | Supabase project root URL |
| `SUPABASE_SECRET_KEY` | Yes | Server-side key used for Storage |
| `SUPABASE_STORAGE_BUCKET` | Yes | Public image bucket name |
| `RUN_MIGRATIONS` | Docker only | Apply Alembic migrations before the command |
| `API_PORT` | Compose only | Host port mapped to container port 8000 |

## Troubleshooting

### `python-dotenv could not parse statement`

Every non-comment `.env` line must use `NAME=value`. Remove pasted prose, Markdown, or shell prompt
text from the file.

### PostgreSQL reports IPv6 `Network is unreachable`

Replace the direct database address with the Supabase session pooler URL on port 5432.

### Storage request contains `/rest/v1/storage/v1`

Remove `/rest/v1` from `SUPABASE_URL`. The SDK appends `/storage/v1` itself.

### Storage upload returns 404

Confirm `SUPABASE_URL` is the project root and that a bucket matching
`SUPABASE_STORAGE_BUCKET` exists.

### Container is unhealthy

Inspect logs:

```bash
docker compose logs api
```

The health endpoint checks database connectivity, so invalid database configuration or blocked
network access makes the health check fail.

### Port 8000 is already in use

Choose another host port:

```bash
API_PORT=8001 docker compose up -d
```

Set `PUBLIC_BASE_URL=http://localhost:8001` so generated order links use the same public address.
