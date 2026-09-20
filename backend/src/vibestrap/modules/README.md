# Предметные модули

Добавляйте домены в `<domain>/`: модели, DTO, сервис и router по мере необходимости.
Router подключается в `api/router.py`, модели — в `migrations/env.py`.
Проверяйте permissions в HTTP-слое и ownership в SQL. Сервис завершает запись
через `await session.commit()` общей сессии запроса.
