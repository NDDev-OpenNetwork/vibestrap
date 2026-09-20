# Backend

- Use `uv run` here; run workspace commands from the root.
- Read `../docs/access-control.md` for auth changes. Permissions live in `auth/policy.py`.
- Business domains belong in `src/vibestrap/modules/<domain>/`. Register routers in
  `api/router.py` and import models in `migrations/env.py`.
- Protect endpoints with `require_permissions`; filter owned data by the authenticated user.
  JWT identifies a user/session; the auth adapter loads current rights from PostgreSQL.
- Alembic owns `app`; Better Auth/Drizzle owns `auth`.
- Auth starts the request transaction. Write services call `await session.commit()`;
  do not nest `session.begin()`.
- Keep DTOs typed and operation IDs stable. Run `bun run api:generate` after API changes.
- Run `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy`, `uv run pytest`.
  Root `bun run test:integration` uses a disposable database and temporary accounts.
