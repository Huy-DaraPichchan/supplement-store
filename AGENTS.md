# AGENTS.md

## Project overview

One product split across two folders:

- `backend/` — FastAPI API (catalog + chat-order). See `.agents/skills/backend/` and
  `backend/AGENTS.md` for stack-specific rules.
- `frontend/` — Next.js 16 storefront (currently mock data; API integration pending). See
  `.agents/skills/frontend/` and `frontend/AGENTS.md` for stack-specific rules.

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

- Do not run destructive or potentially risky commands without confirmation.
- Do not install, uninstall, or upgrade packages without confirmation.
- Do not modify dependencies, lockfiles, database schemas, migrations, or environment
  configuration without confirmation.
- Prefer read-only inspection commands before proposing changes.

## Code style & reusability

- Write clean and reusable code, but avoid over-engineering.
- Prefer simple abstractions that are easy for a decent or mid-level developer to understand
  and extend.
- Do not create extra layers, helpers, services, factories, or generic utilities unless they
  clearly improve maintainability or reduce meaningful duplication.
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

## Stack-specific rules

- Backend: load the `backend` skill (`.agents/skills/backend/`) and read `backend/AGENTS.md`.
- Frontend: load the `frontend` skill (`.agents/skills/frontend/`) and read `frontend/AGENTS.md`.
