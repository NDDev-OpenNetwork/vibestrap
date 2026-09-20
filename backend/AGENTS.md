# Backend

- Use `uv run` here; run workspace commands from the root. Read `../docs/conventions.md` first.
- Business domains belong in `src/vibestrap/modules/<domain>/`; `modules/notes` is the reference.
  Register routers in `api/router.py` and import models in `migrations/env.py`.
- Reuse `db/mixins.py` (id, owner, timestamps), `core/pagination.py` (`Page`, `paginate`) and
  `core/schemas.py` (`ReadModel`, `PartialUpdate`). Never put `strict=True` on a request DTO.
- Protect endpoints with `require_permissions`; filter owned rows in SQL. Permissions live in
  `auth/policy.py`. JWT identifies a user/session; the auth adapter loads current rights from
  PostgreSQL. Read `../docs/access-control.md` for auth changes.
- Alembic owns `app`; Better Auth/Drizzle owns `auth`. `alembic revision --autogenerate` formats
  the generated file through ruff automatically.
- Auth starts the request transaction. Write services call `await session.commit()`;
  do not nest `session.begin()`.
- Keep DTOs typed and operation IDs stable. Run `bun run api:generate` after API changes.
- `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy`, `uv run pytest`.
  `tests/conftest.py` provides `api_client`, `make_api_client`, `make_user` and `db_session`
  (rolled back per test); `tests/test_notes.py` is the reference endpoint test. Root
  `bun run test:integration` uses a disposable database — never point `TEST_DATABASE_URL`
  at a database you care about.
