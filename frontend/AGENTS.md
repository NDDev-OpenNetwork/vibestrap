# Frontend

- Bun 1.4.2 only; run frontend commands here. Root `bun run dev` starts the full stack.
- TanStack Start SPA + React Query. Cookie/localStorage-dependent UI in the prerendered shell uses `ClientOnly`. `app/routes` are thin adapters; page-specific code stays in `pages/<slice>`. Extract shared slices only when reused. Import lower FSD layers through their public APIs.
- Business persistence and permissions belong to FastAPI. `shared/api/generated` comes from OpenAPI (`bun run api:generate`); use `backendClient` with generated SDK/query helpers. Scope private query keys to the current session.
- Better Auth owns only the PostgreSQL `auth` schema through Drizzle. Keep server modules `.server.ts` and out of browser entrypoints. Auth changes: read `shared/auth/AGENTS.md`.
- Locales: `ru` default, `kk` (display `KZ`), `en`. Add keys to all `messages/*.json`; use generated `m`, `Locale`, `locales`, `baseLocale`. Never edit generated i18n, routes or API code.
- shadcn uses Base UI, `base-vega`. `bun run ui:add <component>` installs into `shared/ui/shadcn`; use Base UI `render` composition, and `nativeButton={false}` for links rendered as buttons.
- `bun run fix`, `bun run typecheck`, `bun run check`, `bun run lint:fsd`, `bun run build`. No commits unless explicitly authorized.
