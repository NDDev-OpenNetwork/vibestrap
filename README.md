# VibeStrap

Стартовый проект: TanStack Start / React / TypeScript, FastAPI / Python,
PostgreSQL. Нужны Bun **1.4.2**, uv и Docker Compose.

```sh
bun run setup    # зависимости, .env, PostgreSQL, миграции
bun run seed     # локальные аккаунты и демо-данные
bun run dev      # frontend + backend
```

UI: http://localhost:3000 · API: http://localhost:8000/docs.
Вход: `admin@vibestrap.local` или `user@vibestrap.local`, пароль `vibestrap-dev`.
Настройки — в корневом `.env`. Повторный setup сохраняет секрет и данные.
Ctrl+C останавливает приложения; PostgreSQL остаётся запущенным.
Для параллельной копии задайте в её `.env` уникальные `COMPOSE_PROJECT_NAME`,
`POSTGRES_PORT`, `FRONTEND_PORT`, `BACKEND_PORT` перед setup.

| Из корня | Действие |
| --- | --- |
| `bun run check` / `fix` | Типы, линтеры, форматирование, локали, FSD / автоисправления |
| `bun run test` | Проверки без отдельной БД |
| `bun run verify` | `check` + `test` + `build`, то же что в CI |
| `bun run test:integration` | Авторизация и миграции в одноразовой PostgreSQL БД |
| `bun run build` / `preview` | Production build / локальный запуск сборки |
| `bun run demo` / `demo:stop` | Весь стек в Docker (первая сборка — несколько минут), затем `bun run seed` |
| `bun run api:generate` | FastAPI OpenAPI → типизированный клиент и Query helpers |
| `bun run migrate` | Drizzle auth + Alembic app |
| `bun run seed` / `admin:grant <email>` | Локальные аккаунты, демо-данные, выдача роли admin |
| `bun run token [email]` | JWT локального аккаунта для curl-проверок |
| `bun run install:all` | Только зависимости, без Docker |
| `bun run infra` / `infra:stop` | Запуск / остановка PostgreSQL |

FastAPI владеет прикладными данными (`app`, SQLAlchemy/Alembic).
Better Auth в TanStack Start владеет аккаунтами и сессиями (`auth`, Drizzle).
Модуль `notes` — эталон доменной фичи; как его повторить или удалить, написано в
[соглашениях](docs/conventions.md). Языки: `ru` (по умолчанию), `kk` (KZ), `en`.

`preview` предназначен только для локальной проверки сборки. Продакшен обслуживает
`frontend/server.ts` (`bun run --cwd frontend start`) — Better Auth требует сервер
Start, статического `dist/client` недостаточно. `bun run demo` делает то же в Docker.

[Соглашения](docs/conventions.md) · [Правила доступа](docs/access-control.md) ·
[Backend](backend/README.md) · [Frontend](frontend/README.md).
