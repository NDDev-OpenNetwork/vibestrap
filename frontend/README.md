# Frontend

Из корня: `bun run setup`, затем `bun run dev`.

TanStack Start SPA + React Query. Start обслуживает Better Auth; FastAPI — прикладные данные. Production требует Start server.

- `/` — защищённое рабочее пространство; `/login` — вход и регистрация.
- `src/app/routes` — тонкие маршруты; `src/pages` — страницы; `src/shared/api` — клиент API.
- `bun run ui:add <component>` — компоненты shadcn Base UI.
- `bun run generate` — маршруты и локализация (`ru`, `kk`, `en`).

Frontend-команды запускать из этой директории. Ограничения архитектуры — в `AGENTS.md`.
