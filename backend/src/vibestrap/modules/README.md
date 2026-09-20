# Предметные модули

Эталон — `notes/`: модели, DTO, сервис, router, миграция и тесты
`backend/tests/test_notes.py`. Копируйте его форму, полный порядок действий —
в `../../../../docs/conventions.md`.

Router подключается в `api/router.py`, модели — в `migrations/env.py`.
Permissions проверяются в HTTP-слое, владелец — в SQL-запросе. Сервис завершает
запись через `await session.commit()` общей сессии запроса.
