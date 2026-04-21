# Harness Engineering

## Goal

Omechu uses harness engineering to make code changes safer, more reproducible, and easier to verify.
The harness is not limited to AI agents. It also defines the quality gates that humans and automation follow.

## Current harness

- Agent guidance: `AGENTS.md`, `CLAUDE.md`
- Local quality gates: Husky + `lint-staged`
- CI gates: lint, typecheck, format, unit tests, smoke tests, build
- Runtime observability: Sentry, Vercel Analytics, Vercel Speed Insights
- Deterministic test defaults: `omechu-app/.env.test`
- Example runtime configuration: `omechu-app/.env.example`

## Required local commands

Run from `omechu-app/`.

```bash
pnpm validate
pnpm harness:check
pnpm test:unit
pnpm test:e2e
```

Use the smaller set below when the change is isolated and clearly does not affect runtime behavior:

```bash
pnpm validate
pnpm harness:check
pnpm test:unit
```

## Test policy

- Unit tests protect stable helpers, metadata generation, and project invariants.
- Smoke tests verify the app starts and core public navigation still works.
- Tests must be deterministic and avoid real third-party dependencies.
- `.env.test` is the canonical test environment. Keep it non-secret and stable.

## Supabase policy

Supabase is not wired into the runtime yet, but the project should adopt these rules when it is:

1. Use `@supabase/ssr` for browser/server clients and cookie-based auth.
2. Use Supabase Branching for preview and staging data isolation.
3. Keep production data out of AI tooling, local branches, and preview branches.
4. Add `supabase db lint`, `supabase test db`, and RLS policy tests to CI before shipping schema changes.
5. Scope Supabase MCP to a development project or branch and prefer read-only access unless write access is required for a task.

Current development project:

- Project ref: `xztldvunnasjaxnzqpct`
- URL: `https://xztldvunnasjaxnzqpct.supabase.co`
- Publishable key is tracked only in `.env.example` and docs because it is intended for public client use.
- Secret key must stay in local envs / deployment secrets only.

## Review checklist

- Does the change update or bypass an existing harness rule?
- Is there at least one automated verification path for the changed behavior?
- Are observability hooks still present after the change?
- Does the change require new test env defaults?
- If a future Supabase integration is touched, is the change safe for branch-based validation?
