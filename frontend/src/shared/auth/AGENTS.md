# Auth integration rules

Read `../../../../docs/access-control.md` before changing this segment.

- Browser consumers import the explicit public API from `#/shared/auth`.
- Server auth configuration imports `#/shared/auth/index.server`; never import browser hooks on the server.
- `Role`, `Permission` and `CurrentUser` are generated from FastAPI OpenAPI.
- Use `useAccess`, `Can`, `requireAccess` or the pure permission helpers. Do not implement an application role/permission matrix in React or infer application permissions from Better Auth session roles.
- UI guards are presentation helpers. Backend and Better Auth must enforce every operation independently.
- Preserve AuthCacheBoundary's logout/session-switch cleanup; use the generated query keys without manual session scoping.
- Admin plugin operations have a separate explicit allowlist in admin-access.ts, checked on its server.
- Regenerate types with `bun run api:generate`; run `bun run test`, typecheck and FSD checks.
