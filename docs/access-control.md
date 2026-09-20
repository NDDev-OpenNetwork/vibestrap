# Доступ

Better Auth владеет аккаунтами и cookie-сессиями в `auth` (Drizzle).
FastAPI владеет прикладными правами и данными в `app` (SQLAlchemy/Alembic).

JWT действует 5 минут. FastAPI проверяет подпись через JWKS и актуальные роль,
блокировку и сессию через `auth/identity.py`. Отзыв сессии и смена роли действуют
со следующего запроса. Роли из JWT или входного запроса не дают прав.
Сохраняйте `BETTER_AUTH_SECRET`: им зашифрованы приватные JWT-ключи в БД.

| Политика | Источник |
| --- | --- |
| Прикладные роли и permissions | `backend/src/vibestrap/auth/policy.py` |
| Операции Better Auth Admin plugin | `frontend/src/shared/auth/admin-access.ts` |
| Эффективные права интерфейса | `GET /api/v1/me` → `#/shared/auth` |
| Типы Role / Permission / CurrentUser | OpenAPI → сгенерированный клиент |

Обе роли имеют `profile:read`. Только `admin`: `access:read`, `users:read`,
`users:manage`, `sessions:revoke`. Новые permissions выдаются явно;
неизвестные роли запрещены. Admin plugin отдельно проверяет операции с аккаунтами.
Публичная регистрация создаёт обычного пользователя.

## Изменения API

Добавляйте permission и grants в `policy.py`, защищайте endpoint через
`Depends(require_permissions(...))`. Все переданные permissions обязательны.
Для личных данных проверяйте владельца в запросе к БД. Auth lookup уже открывает
транзакцию; завершайте изменения `await session.commit()`.

После изменений запускайте `bun run api:generate` и проверяйте разрешённый и
запрещённый доступ. Для новой роли также обновите auth CHECK constraint миграцией,
`adminRoles` и `admin-access.ts`.

## Frontend

Используйте `useAccess`, `Can`, `requireAccess` из `#/shared/auth`.
`requireAccess` перенаправляет анонимного пользователя на `/login`, при нехватке
прав возвращает 403. Backend проверяет каждую операцию независимо от UI.
Не проверяйте строки `user.role` в компонентах.

После административного изменения вызывайте `invalidateAccess(queryClient)`.
`AuthCacheBoundary` отменяет запросы и очищает кеш при logout/смене сессии.
`backendClient` получает JWT через cookie-сессию; серверный код использует
`createBackendClient` с токеном конкретного запроса.

`bun run test:integration` проверяет миграции и реальную авторизацию в одноразовой
БД, затем удаляет её.
