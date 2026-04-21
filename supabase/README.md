# Supabase

현재 리뉴얼 대상 Supabase 개발 프로젝트:

- Project ref: `xztldvunnasjaxnzqpct`
- URL: `https://xztldvunnasjaxnzqpct.supabase.co`
- Publishable key:
  `sb_publishable_TW1dRfU6xM4uxpt2jodk8w_AIO67EMq`

## Env rules

Use these variable names:

```env
SUPABASE_PROJECT_REF=xztldvunnasjaxnzqpct
NEXT_PUBLIC_SUPABASE_URL=https://xztldvunnasjaxnzqpct.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TW1dRfU6xM4uxpt2jodk8w_AIO67EMq
SUPABASE_SECRET_KEY=your_supabase_secret_key_here
```

- `NEXT_PUBLIC_SUPABASE_URL`: public
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public
- `SUPABASE_SECRET_KEY`: server only, never commit

## Planned runtime integration

When the app is migrated, prefer this layout in `omechu-app/src/`:

```text
src/shared/lib/supabase/client.ts
src/shared/lib/supabase/server.ts
src/proxy.ts
```

## Planned database workflow

```bash
supabase db lint
supabase test db
```

Use Supabase branches for preview work. Do not connect AI tooling or MCP to production.
