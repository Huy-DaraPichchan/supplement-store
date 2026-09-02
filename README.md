# Supplement Store

A monorepo for a supplement storefront. Customers browse products and create orders
without accounts; admins log in to manage the catalog, stock, business settings, and
order status. Payment is handled manually outside the site.

## Project layout

```text
supplement-store/
├── backend/     FastAPI API            (catalog + chat-order, SQLAlchemy, Alembic, Supabase)
├── frontend/    Next.js storefront     (API-backed infinite-scroll catalog)
│   ├── Dockerfile       production container build
│   └── compose.yaml     frontend Docker startup
└── AGENTS.md    Global agent rules for the whole repo
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
Products are loaded from the backend API through the `/api/backend/*` proxy. The catalog loads 12
products at a time as the user scrolls, with responsive cards, search, category filtering, and
animated loading states.

The recommended way to run the frontend is Docker:

```bash
cd frontend
docker compose up --build
```

Open http://localhost:3000.

For local development without Docker:

```bash
cd frontend
npm install
npm run dev
```

The frontend calls the backend through its `/api/backend/*` proxy. The Docker setup defaults to
`http://host.docker.internal:8000`; set `BACKEND_URL` when the API is elsewhere (for example,
`BACKEND_URL=http://api:8000` when both services share a Docker network). See
`frontend/README.md` and `frontend/tech.md` for details.

## Agent instructions

- `AGENTS.md` — all global, backend, and frontend agent instructions for this repo.
