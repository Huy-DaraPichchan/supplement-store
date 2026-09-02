---
name: backend
description: Backend (FastAPI) work in this repo: architecture rules, DB/storage constraints, and run/test commands for the supplement-store API.
---

## Stack

- FastAPI, Pydantic, SQLAlchemy 2.x, and Alembic
- SQLite locally; Supabase PostgreSQL when hosted
- Supabase Storage for product images
- JWT authentication for admins only
- Docker Compose for portable setup
- Redis (later)

## Rules

- Use SQLAlchemy for database CRUD — never `supabase.table(...)`.
- Use the Supabase SDK only for Storage.
- Do not integrate image upload into POST /products yet.
- Do not add Redis yet.
- Inspect the existing project before proposing changes.
- Public/customer and admin flows are separate routers; keep them that way.

## Run (backend/)

Docker (local SQLite):

```bash
docker compose up --build -d
docker compose run --rm api python -m app.cli create-admin --email admin@example.com
docker compose run --rm api python -m app.cli seed
```

uv (no Docker):

```bash
uv sync
uv run alembic upgrade head
uv run python -m app.cli create-admin --email admin@example.com
uv run python -m app.cli seed
uv run uvicorn app.main:app --reload
```

## Test

```bash
uv run pytest
```

API: http://localhost:8000 · Swagger: http://localhost:8000/docs · Health: http://localhost:8000/health
