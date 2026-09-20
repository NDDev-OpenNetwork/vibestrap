# Project conventions

- Use Bun 1.4.2 as the only JavaScript/TypeScript runtime and package manager. Run frontend commands from `frontend/`.
- Use `bun install`, `bun add`, `bun remove`, `bun run <script>`, and `bunx --bun` for one-off tools. Prefer the project's installed commands and frozen lockfile.
- Run TypeScript scripts directly with Bun. Keep tooling, CI, hooks, examples, and project skill instructions consistent with this runtime.
- When applying an external skill, adapt all JavaScript/TypeScript commands to Bun. Generic package-manager examples in a skill do not override this project convention. Python backend tooling continues to use uv.
- Locales are `ru`, `kk`, and `en`, with Russian as the default. The Kazakh display label is `KZ`; its language code is `kk`.
- Do not create commits unless the user explicitly revokes the current no-commits instruction.

# Workspace

- Run `bun run setup` once, then `bun run dev` from the root. Root `.env` is inherited by both apps; do not duplicate settings in service env files.
- `bun run check`, `test`, `build`, `api:generate` cover both apps. `test:integration` creates and removes its own PostgreSQL database.
- Business data: FastAPI `backend/src/vibestrap/modules`, SQLAlchemy/Alembic `app` schema. Better Auth/Drizzle owns only `auth`.
- Read `docs/access-control.md` for auth changes. Regenerate contract/client after API changes; never hand-edit generated sources.
- Keep the starter free of sample domains and data. Add product features only when requested. Keep instructions brief and repo-specific.
