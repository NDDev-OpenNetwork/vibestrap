# Project conventions

- Use Bun 1.4.2 as the only JavaScript/TypeScript runtime and package manager. Run frontend commands from `frontend/`.
- Use `bun install`, `bun add`, `bun remove`, `bun run <script>`, and `bunx --bun` for one-off tools. Prefer the project's installed commands and frozen lockfile.
- Run TypeScript scripts directly with Bun. Keep tooling, CI, hooks, examples, and project skill instructions consistent with this runtime.
- When applying an external skill, adapt all JavaScript/TypeScript commands to Bun. Generic package-manager examples in a skill do not override this project convention. Python backend tooling continues to use uv.
- Locales are `ru`, `kk`, and `en`, with Russian as the default. The Kazakh display label is `KZ`; its language code is `kk`.
- Do not create commits unless the user explicitly revokes the current no-commits instruction.

# Workspace

- `bun run setup` once, then `bun run dev` from the root. `bun run install:all` installs dependencies only — use it when PostgreSQL is already running or shared.
- Root `.env` is the only source of settings; do not duplicate them in service env files or add default connection strings in code.
- `bun run check`, `test`, `build`, `api:generate` cover both apps. `test:integration` creates and removes its own PostgreSQL database.
- `bun run seed` creates local accounts (`admin@` / `user@vibestrap.local`, password `vibestrap-dev`) and demo data; `bun run admin:grant <email>` promotes one account. Public sign-up can only create a regular user.
- `bun run token [email]` prints a JWT for curl checks against a running API.
- `bun run demo` runs the whole stack in Docker on one command; `bun run dev` is the working loop.
- `bun run dev` never exits. Verify with `check`/`test`, or start it in the background and poll `/health/ready`.

# Conventions

- **Read `docs/conventions.md` before adding a feature.** It fixes the id, ownership, pagination, PATCH, error, i18n and data-loading decisions, and lists the files a new domain touches.
- `modules/notes` (backend) and `pages/notes` (frontend) are the reference implementation. Copy their shape; `docs/conventions.md` says how to delete them.
- Business data: FastAPI `backend/src/vibestrap/modules`, SQLAlchemy/Alembic `app` schema. Better Auth/Drizzle owns only `auth`.
- Read `docs/access-control.md` for auth changes. Regenerate contract and client after API changes; never hand-edit generated sources.
- Keep instructions brief and repo-specific.
