# AGENTS.md

## Project overview

One product split across two folders:

- `backend/` — FastAPI API (catalog + chat-order).
- `frontend/` — Next.js 16 storefront (API-backed, infinite scroll).

## Scope

- The project root is the working boundary for all writes: never modify, create, or delete
  files outside it.
- Read-only access outside the project root is allowed (e.g. inspecting config, logs, or
  session history under the user's home directory).
- Do not execute anything outside the project root.
- Do not modify global system files, shell configuration, or files outside the repository.
- Writing or deleting anything outside the project root requires explicit user confirmation
  and a clearly stated target path.

## Changes

- Do not apply code changes immediately.
- First inspect the relevant files and prepare the proposed changes.
- Show a concise summary of:
  - what will change
  - which files will change
  - any important side effects
- When useful, show the proposed diff or code.
- Wait for explicit user confirmation before modifying files.
- Only apply the exact changes that were approved.
- If the implementation changes significantly after approval, ask for confirmation again.

## Commands

- Never execute a user-requested command immediately if it can modify files,
  install packages, change configuration, alter data, or affect external services.
  First explain what it will do and wait for explicit confirmation.
- Do not run destructive or potentially risky commands without confirmation.
- Do not install, uninstall, or upgrade packages without confirmation.
- Do not modify dependencies, lockfiles, database schemas, migrations, or environment
  configuration without confirmation.
- Prefer read-only inspection commands before proposing changes.

## Code style & reusability

- Write clean and reusable code, but avoid over-engineering.
- Write code that a beginner or intermediate developer can understand, debug, and
  continue developing without learning unnecessary architecture first.
- Avoid excessive loose coupling, indirection, and abstraction. Keep related logic
  together when separating it does not provide a clear maintenance benefit.
- Prefer simple abstractions that are easy for a decent or mid-level developer to understand
  and extend.
- Do not create extra layers, helpers, services, factories, or generic utilities unless they
  clearly improve maintainability or reduce meaningful duplication.
- Add comments sparingly. Comment non-obvious intent, constraints, reusable behavior,
  or logic referenced indirectly from elsewhere.
- Do not add comments that merely repeat what the code already says.
- Optimize for the current project and likely next steps.
- Prefer explicit code over clever or overly abstract code.
- Keep functions focused, but do not split simple logic into too many tiny functions.
- Use patterns and abstractions only when they make the code easier to follow.
- Keep naming straightforward and predictable.
- Leave the code in a state where the user can comfortably continue developing it without
  needing to understand unnecessary architecture first.
- When multiple valid implementations exist, prefer the simpler one that is still maintainable.

## Communication

- Keep responses short, clear, and meaningful.
- Avoid unnecessary explanations, repetition, or long summaries.
- When proposing changes, focus only on information needed to make a decision.
- If the user explicitly asks for an explanation, lesson, reasoning, or detailed breakdown,
  provide more detail.
- Ask questions only when information is genuinely required to proceed safely or correctly.

## Workflow

Follow this order:

1. Inspect
2. Understand
3. Propose
4. Show planned changes
5. Wait for confirmation
6. Apply approved changes
7. Briefly report the result

Never skip the confirmation step before editing files.

## Backend

- Stack: FastAPI, Pydantic, SQLAlchemy 2.x, Alembic, SQLite locally, Supabase PostgreSQL when
  hosted, Supabase Storage for product images, JWT authentication for admins, and Docker Compose.
- Redis is planned later and is not part of the current scope.
- Use SQLAlchemy for database CRUD. Never use `supabase.table(...)`.
- Use the Supabase SDK only for Storage.
- Do not integrate image upload into `POST /products` yet.
- Inspect the existing project before proposing changes.

## Frontend

- Stack: Next.js 16.3.1, React, TypeScript, Aceternity UI, MagicUI, Framer Motion, motion, and
  lucide-react.
- Before planning or implementing frontend changes, read the repository root
  `DESIGN.md` and follow its visual, UX, responsive, accessibility, and motion rules.
- Treat `DESIGN.md` as the source of truth for frontend design decisions. If an
  approved implementation changes the design system, update `DESIGN.md` in the
  same change.
- This is NOT the Next.js you know. APIs, conventions, and file structure may differ from older
  versions. Read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing
  code, and heed deprecation notices.
- Put all components in `frontend/components/`.
- Reserve `frontend/components/ui/` for components generated by `npx` from Aceternity or MagicUI;
  do not hand-write files there.
- Prefer shadcn components and existing project components when they fit. Use
  Aceternity UI, MagicUI, and motion libraries only when they support the intended
  experience; do not add animation merely because an animated component is available.
- Define shared visual values as semantic tokens in `frontend/app/globals.css`.
  Components should consume semantic classes instead of introducing raw colors.
- Do not use blue or green in the frontend. The primary brand color is `#bc1a8d`;
  follow `DESIGN.md` for the complete light and dark palettes.
- The frontend fetches products from the backend through the `/api/backend/*` proxy. Confirm
  before changing the API layer or connecting it directly from the browser.
