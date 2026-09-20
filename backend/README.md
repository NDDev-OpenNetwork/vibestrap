# Backend

FastAPI · SQLAlchemy async · Alembic. Запуск и проверки — из [корня](../README.md).
Swagger: `http://localhost:8000/docs`. Настройки читаются из корневого `.env`.

- `api/` — HTTP router, health checks.
- `modules/` — прикладные домены.
- `auth/` — JWT, сессии, [права доступа](../docs/access-control.md).
- `core/` — настройки, ошибки, логирование.

Для нового домена добавить модели/DTO/router, подключить router в `api/router.py`
и импортировать модели в `migrations/env.py`. Alembic владеет только `app`:

```sh
uv run alembic revision --autogenerate -m "add projects"
uv run alembic upgrade head
```

После изменения API — `bun run api:generate` из корня. Запись завершать явным
`await session.commit()`; общая сессия уже открыла транзакцию при проверке auth.
