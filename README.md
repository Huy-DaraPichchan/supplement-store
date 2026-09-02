# Supplement Store

A monorepo for a supplement storefront. Customers browse products and create orders
without accounts; admins log in to manage the catalog, stock, business settings, and
order status. Payment is handled manually outside the site.

## Project layout

```text
supplement-store/
├── backend/     FastAPI API            (catalog + chat-order, SQLAlchemy, Alembic, Supabase)
├── frontend/    Next.js storefront     (currently mock data, API integration pending)
├── AGENTS.md    Global agent rules for the whole repo
└── .agents/
    └── skills/
        ├── backend/    backend-specific rules (loaded on demand)
        └── frontend/   frontend-specific rules (loaded on demand)
```

## Backend

FastAPI + SQLAlchemy 2.x with Alembic migrations. SQLite locally, Supabase PostgreSQL when
hosted. Supabase Storage for product images. JWT auth for admins only.

```bash
cd backend

# Docker (local SQLite)
docker compose up --build -d
docker compose run --rm api python -m app.cli create-admin --email admin@example.com
docker compose run --rm api python -m app.cli seed

# or without Docker (uv)
uv sync
uv run alembic upgrade head
uv run python -m app.cli create-admin --email admin@example.com
uv run python -m app.cli seed
uv run uvicorn app.main:app --reload
```

API: http://localhost:8000 · Swagger: http://localhost:8000/docs

See `backend/README.md` and `backend/docs/` for details.

## Frontend

Next.js 16 storefront. Uses Aceternity UI / MagicUI components, Framer Motion, and lucide-react.
Currently backed by mock data in `lib/data.ts`; wiring it to the backend API is planned.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. See `frontend/README.md` and `frontend/tech.md`.

## Agent instructions

- `AGENTS.md` — global rules for all work in this repo.
- `.agents/skills/backend/` — load the `backend` skill when working in `backend/`.
- `.agents/skills/frontend/` — load the `frontend` skill when working in `frontend/`.
- Each stack keeps its own always-on `backend/AGENTS.md` and `frontend/AGENTS.md`.
