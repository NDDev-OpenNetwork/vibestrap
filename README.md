# VibeStrap

Стартовый проект: TanStack Start / React / TypeScript, FastAPI / Python,
PostgreSQL. Нужны Bun **1.4.2**, uv и Docker Compose.

```sh
bun run setup    # зависимости, .env, PostgreSQL, миграции
bun run dev      # frontend + backend
```

UI: http://localhost:3000 · API: http://localhost:8000/docs.
Настройки — в корневом `.env`. Повторный setup сохраняет секрет и данные.
Ctrl+C останавливает приложения; PostgreSQL остаётся запущенным.

| Из корня | Действие |
| --- | --- |
| `bun run check` / `fix` | Типы, линтеры, форматирование, FSD / автоисправления |
| `bun run test` | Проверки без отдельной БД |
| `bun run test:integration` | Авторизация и миграции в одноразовой PostgreSQL БД |
| `bun run build` / `preview` | Production build / локальный запуск сборки |
| `bun run api:generate` | FastAPI OpenAPI → типизированный клиент и Query helpers |
| `bun run migrate` | Drizzle auth + Alembic app |
| `bun run infra` / `infra:stop` | Запуск / остановка PostgreSQL |

FastAPI владеет прикладными данными (`app`, SQLAlchemy/Alembic).
Better Auth в TanStack Start владеет аккаунтами и сессиями (`auth`, Drizzle).
Начальная оболочка содержит вход и пустое рабочее пространство; аккаунт создаётся
через регистрацию. Языки: `ru` (по умолчанию), `kk` (KZ), `en`.

[Правила доступа](docs/access-control.md) · [Backend](backend/README.md) · [Frontend](frontend/README.md).
