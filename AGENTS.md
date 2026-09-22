# Project conventions

- Use Bun 1.4.2 as the only JavaScript/TypeScript runtime and package manager. Run frontend commands from `frontend/`.
- Use `bun install`, `bun add`, `bun remove`, `bun run <script>`, and `bunx --bun` for one-off tools. Prefer the project's installed commands and frozen lockfile.
- Run TypeScript scripts directly with Bun. Keep tooling, CI, hooks, examples, and project skill instructions consistent with this runtime.
- When applying an external skill, adapt all JavaScript/TypeScript commands to Bun. Generic package-manager examples in a skill do not override this project convention. Python backend tooling continues to use uv.
- Locales are `ru`, `kk`, and `en`, with Russian as the default. The Kazakh display label is `KZ`; its language code is `kk`.
- Do not create commits unless the user explicitly revokes the current no-commits instruction.

# Workspace

- `bun run setup` once, then `bun run dev` from the root. `bun run install:all` installs dependencies only — use it when PostgreSQL is already running or shared.
- Root `.env` is the only source of settings; do not duplicate them in service env files or add default connection strings in code.
- `bun run check`, `test`, `build`, `api:generate` cover both apps. `test:integration` creates and removes its own PostgreSQL database.
- `bun run seed` creates local accounts (`admin@` / `user@vibestrap.local`, password `vibestrap-dev`) and demo data; `bun run admin:grant <email>` promotes one account. Public sign-up can only create a regular user.
- `bun run token [email]` prints a JWT for curl checks against a running API.
- `bun run demo` runs the whole stack in Docker on one command; `bun run dev` is the working loop.
- `bun run dev` never exits. Verify with `check`/`test`, or start it in the background and poll `/health/ready`.

# Conventions

- **Read `docs/conventions.md` before adding a feature.** It fixes the id, ownership, pagination, PATCH, error, i18n and data-loading decisions, and lists the files a new domain touches.
- `modules/notes` (backend) and `pages/notes` (frontend) are the reference implementation. Copy their shape; `docs/conventions.md` says how to delete them.
- Business data: FastAPI `backend/src/vibestrap/modules`, SQLAlchemy/Alembic `app` schema. Better Auth/Drizzle owns only `auth`.
- Read `docs/access-control.md` for auth changes. Regenerate contract and client after API changes; never hand-edit generated sources.
- Keep instructions brief and repo-specific.

# Fork exceptions (vs hack-setup standards)

This template deliberately deviates from the generic hack-setup pin.
Each exception is recorded in `build/stack-pin.json` — these are settled
decisions, not drift:

- **react-hook-form + zodResolver** instead of TanStack Form: RHF is
  already wired into the shadcn `Field` primitives and
  `docs/conventions.md`; do not migrate mid-event.
- **@tanstack/react-start** (SPA) instead of a bare Vite entry: still
  Vite 8.3 + React 19.3 + TS 7.0.2 underneath — the pin lines hold.
- **better-auth/drizzle** owns only the PostgreSQL `auth` schema.
  Business persistence stays FastAPI + SQLAlchemy/Alembic in `app`;
  never let Drizzle touch `app`.
- **bun-only / uv-only** is not an exception — same law as hack-setup.

# Hackathon workflow (Saint Tibo)

Lanes: `feat/<issue>-<slug>` → `<user>` (`danil`/`ivan`/`artem`) → `dev`
→ `main`. Each member merges their own `<user>` lane into `dev`
themselves: pull `dev`, make the merge green, `git merge --no-ff`, push,
verify on their own dev server. Only `dev` → `main` is gated — the
integrator (Danil) ships it. Merges keep full history: `--no-ff` only,
never squash or rebase merges (hooks deny them). Deploys are server-side
pull watchers: each member's dev server follows `dev`, the single prod
server follows `main` (kit: `hack-setup install/deploy/`).

- Orchestration: the main Codex App chat spawns worker threads with
  `codex_app.*` task tools — `create_thread {prompt≤1000B, title?,
  model?}` (thread inherits cwd; brief file at `.agent/briefs/*.md`),
  `wait_threads`, `read_thread`, `send_message_to_thread`. Not
  subagents. Full playbook: `$hack-agent-workflow:delegate-worker`.
- Rules live in `$hack-agent-workflow:` skills — `github-flow` (lanes +
  release gate), `hack-mode` (laziest working solution, no review round,
  no test suite, `hack:` markers), `ship-verify` (build on the server,
  check live — done means live), `debt-ledger`, `session-boot`,
  `agent-handoff`. Plugins install from the `hack-setup` marketplace.
- Issues are the source of truth: claim files in an issue comment
  before editing; `done: <sha>` comment when merged to your lane.
- Commits are expected on feat and `<user>` branches as part of the
  loop; the no-commits rule above applies only outside hackathon work.

# Codex surface

`.codex/config.toml` mirrors `hack-setup` law: `gpt-6-astra` /
`gpt-5.6-sol` at `xhigh`, `approval_policy = "never"`,
`sandbox_mode = "danger-full-access"`, `web_search = "live"`, agents
off, hooks on, the six MCP servers (serena/shadcn/context7/grep/
deepwiki/keenable). `.codex/hooks.json` injects the hack-mode ruleset
at session start and a STATUS line per prompt. Hooks only run while
their `trusted_hash` in `~/.codex/config.toml` matches the definition —
after pulling hook changes run
`python3 <hack-setup>/scripts/repair_setup.py --root . --only hook-trust`
(ADR 0016 in hack-setup).

Lane enforcement is mechanical: `.codex/lanes.json` declares `main`
protected and the PreToolUse hook denies `git push` to it and
`gh pr merge` from any checkout without the untracked
`.agent/orchestrator` marker — the integrator creates it once in his
main checkout; worker worktrees never have it. `dev` is shared.

# Devin surface

`.devin/` mirrors `hack-setup/devin-setup` law: `config.json`
(permissions, `read_config_from` off), `mcp_config.json` (the same six
MCP servers), `hooks.v1.json` → `.devin/hooks/devin_mode.py` (ruleset,
STATUS line, and the same lane guard — it reads `.codex/lanes.json`).
Model and session law come from the Devin user config managed by
`devin-setup/./setup`. Skills: `/hack-devin-workflow:<skill>`; workers
are real Devin sessions in herdr panes, not subagents.
