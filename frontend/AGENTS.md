# Frontend

- Bun 1.4.2 only; run frontend commands here. Root `bun run dev` starts the full stack. Read `../docs/conventions.md` before adding a page or a query.
- TanStack Start SPA + React Query. Cookie/localStorage-dependent UI in the prerendered shell uses `ClientOnly`. `app/routes` are thin adapters; page-specific code stays in `pages/<slice>`. Extract shared slices only when reused. Import lower FSD layers through their public APIs.
- Business persistence and permissions belong to FastAPI. `shared/api/generated` comes from OpenAPI (`bun run api:generate`); use `backendClient` with the generated SDK and query helpers, and `invalidateResource` after a mutation. `AuthCacheBoundary` clears the cache on logout and session switch, so query keys need no session scoping.
- Better Auth owns only the PostgreSQL `auth` schema through Drizzle. Keep server modules `.server.ts`, import them through a slice's `index.server.ts`, and keep them out of browser entrypoints. Auth changes: read `shared/auth/AGENTS.md`.
- Locales: `ru` default, `kk` (display `KZ`), `en`. Add a string with `bun run i18n:add <key> "<ru>" "<kk>" "<en>"`; `bun run i18n:check` runs in `bun run check`. Never edit generated i18n, routes or API code.
- Forms: `react-hook-form` + `zodResolver` with the `Field` primitives. Feedback: `toast` from `shared/ui/shadcn/toast`.
- shadcn uses Base UI, `base-vega`. `bun run ui:add <component>` vendors into `shared/ui/shadcn` (non-interactive, overwrites). Those files are vendor code: excluded from lint and format, never hand-edited. Use Base UI `render` composition, and `nativeButton={false}` for links rendered as buttons.
- `bun run fix`, `bun run typecheck`, `bun run check`, `bun run lint:fsd`, `bun run test`, `bun run build`. No commits unless explicitly authorized.
