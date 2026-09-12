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
| Deploy the production branch | [FastAPI Cloud production](#fastapi-cloud-production) |
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

## FastAPI Cloud production

Production backend deployments run from `.github/workflows/deploy-backend-prod.yml` when backend
changes are pushed to `prod`. The workflow installs locked dependencies, runs the backend tests,
applies all Alembic migrations, and deploys the existing FastAPI Cloud app. A failed test or
migration stops the deployment.

Configure these GitHub Actions repository secrets before the first run:

| Secret | Value |
| --- | --- |
| `FASTAPI_CLOUD_TOKEN` | FastAPI Cloud deploy token |
| `FASTAPI_CLOUD_APP_ID` | ID of the existing FastAPI Cloud app |
| `PROD_DATABASE_URL` | Production Supabase session-pooler URL on port `5432` |

From the backend directory, create the FastAPI Cloud secrets after authenticating the CLI:

```bash
uv run fastapi login
uv run fastapi cloud setup-ci --secrets-only .
```

If GitHub CLI authentication is unavailable, the command prints the values so they can be added
under **GitHub repository → Settings → Secrets and variables → Actions**. Add
`PROD_DATABASE_URL` there separately. Deploy tokens expire after 365 days; rerun the setup command
to replace an expiring token.

The FastAPI Cloud app keeps its existing environment variables and custom domain. Disconnect its
native Source Repository integration only after the GitHub secrets and workflow are ready; this
prevents the repository default branch from continuing to deploy the app.

## Technology

- FastAPI, Pydantic, SQLAlchemy 2.x, and Alembic
- SQLite locally and Supabase PostgreSQL when hosted
- Supabase Storage for product images
- JWT authentication for admins only
- Docker Compose for portable setup

Redis, customer accounts, online payments, and automatic chat sending are intentionally outside
the current scope.
