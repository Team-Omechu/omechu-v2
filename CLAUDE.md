@AGENTS.md

# CLAUDE.md

Claude Code(claude.ai/code)가 이 저장소 작업 시 참고할 가이드.

## Overview

**오메추** (오늘 뭐 먹지?) — 사용자 상태와 취향을 반영해 맞춤 메뉴·맛집을 추천하는 Next.js 풀스택 웹 서비스.

원본: UMC 8기 팀 프로젝트 (`Team-Omechu/Omechu-web`, MIT)
현재: 개인 포폴·여친 PM 포폴 보조 목적 **Next.js + Supabase 리뉴얼**.

## Tech Stack

- **Framework**: Next.js 16 App Router (Turbopack)
- **Language**: TypeScript (strict + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`)
- **Styling**: Tailwind CSS 4 (CSS-first config)
- **State**: Zustand (client) / TanStack Query (server)
- **Forms**: React Hook Form + Zod 4
- **Testing**: Vitest (unit) / Playwright (e2e smoke)
- **Monitoring**: Sentry + Vercel Analytics + Speed Insights
- **Package Manager**: pnpm (강제 — `npm`/`yarn` 금지)
- **Deploy**: Vercel Hobby + Supabase Free (마이그레이션 진행 중)

## 디렉토리 구조

모든 커맨드는 `omechu-app/`에서 실행.

```
omechu-renewal/
├── omechu-app/              # Next.js app
│   ├── src/
│   ├── e2e/                 # Playwright smoke
│   ├── docs/CONVENTIONS.md  # 코드 스타일 + Git + Lint Policy
│   ├── eslint.config.mjs
│   ├── commitlint.config.mjs
│   └── ...
├── .husky/                  # Git hooks (pre-commit, commit-msg, pre-push)
├── .github/workflows/ci.yml
├── AGENTS.md                # AI agent 규칙 (Claude Code / Codex 등)
├── CLAUDE.md                # 이 파일
└── README.md                # 프로젝트 설명
```

## Scripts (in `omechu-app/`)

```bash
pnpm dev             # dev server (http://localhost:3000)
pnpm build
pnpm start

pnpm lint            # ESLint
pnpm lint:fix        # ESLint 자동 수정
pnpm format          # Prettier 쓰기
pnpm format:check    # Prettier 검사
pnpm typecheck       # tsc --noEmit

pnpm test            # = test:unit
pnpm test:unit       # Vitest (one-shot)
pnpm test:unit:watch # Vitest watch
pnpm test:e2e        # Playwright

pnpm validate        # lint + typecheck + format:check
pnpm validate:ci     # validate + test:unit (CI용)
```

## Architecture — FSD 4-Layer

```
app → widgets → entities → shared
```

### Import Rules (ESLint error 차단)

| From | Can import | Cannot |
|------|-----------|--------|
| `shared` | external only | `app`, `widgets`, `entities` |
| `entities` | `shared` | `app`, `widgets` |
| `widgets` | `entities`, `shared` | `app` |
| `app` | `widgets`, `entities`, `shared` | — |

**Public API 강제**: 다른 슬라이스 내부 경로(`@/entities/user/model/*` 등) 직접 찌르기 금지. 반드시 `@/entities/{slice}`의 `index.ts` barrel 경유.

```ts
// ❌ Deep import (ESLint error)
import { useAuthStore } from "@/entities/user/model/auth.store";

// ✅ Barrel
import { useAuthStore } from "@/entities/user";
```

**슬라이스 네이밍**: `src/widgets/*`, `src/entities/*` 하위는 kebab-case 강제 (`check-file/folder-naming-convention`).

### Path Aliases

```
"@/*"          → "./src/*"
"@/app/*"      → "./src/app/*"
"@/widgets/*"  → "./src/widgets/*"
"@/entities/*" → "./src/entities/*"
"@/shared/*"   → "./src/shared/*"
```

### Entity Module Structure

```
{slice}/
├── api/          # API calls (axios)
├── model/        # hooks, stores, types, schemas
├── ui/           # components
├── lib/          # utils
├── config/       # constants
└── index.ts      # Public API barrel
```

## Code Conventions

### Naming

- 컴포넌트 `.tsx`: PascalCase (`MenuCard.tsx`)
- Next 예약 파일: lowercase (`page.tsx`, `layout.tsx`, `global-error.tsx` 등)
- 훅 `.ts`: camelCase + `use*` (`useAuth.ts`)
- 유틸/API `.ts`: camelCase (`axiosInstance.ts`, `authApi.ts`)
- 타입 파일: `*.types.ts`
- 슬라이스 폴더: kebab-case
- 상수: UPPER_SNAKE_CASE
- 타입/인터페이스: PascalCase

상세: `omechu-app/docs/CONVENTIONS.md`.

### Component Rules

- `function` 선언 사용 (arrow export 지양)
- `'use client'` 는 필요한 곳만 최소한으로
- Server Component 우선

### Styling

- Tailwind 유틸리티 클래스
- 인라인 style 금지
- 조건부 클래스는 `cn()` (`clsx` + `tailwind-merge`)
- variants는 CVA
- 모바일 고정 레이아웃: `max-w-120 min-w-93.75` (375px 기준)

### Error Handling

- `console.log` 금지 (ESLint warn) — `console.warn`, `console.error`만
- API 에러 명시 처리
- `any` 사용 최소화 (ESLint warn)

## Authentication

- JWT + Axios interceptor (refresh token queue)
- Zustand persist (localStorage)
- Client-side 보호: `app/(private)/layout.tsx`의 `ProtectedRoute`
- Supabase Auth 전환 예정

## State Management

- Zustand stores (persist middleware)
  - `auth.store.ts`, `onboarding.store.ts`, `tagData.store.ts`, `questionAnswer.store.ts`, `locationAnswer.store.ts`
- Server state: TanStack React Query (caching, infinite query, optimistic mutation)

## API Layer

- Centralized Axios instance (`src/shared/lib/axiosInstance.ts`)
- Base URL: `NEXT_PUBLIC_API_URL`
- Response wrapper: `{ resultType, error, success }`
- `fetchJSON` 유틸: `resultType` 자동 언래핑 + 404 → `[]`
- Next Route Handlers (`src/app/api/`): Google Places / Geocode 프록시

## Git / Husky

- `.husky/pre-commit`: lint-staged (`eslint --fix → prettier --write → tsc --noEmit`)
- `.husky/commit-msg`: commitlint (Conventional Commits)
- `.husky/pre-push`: `pnpm validate` 게이트

**우회 금지**: `git commit --no-verify`, `git push --no-verify`, `SKIP_*` 환경변수 모두 금지. CI가 최종 게이트.

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=<backend-api-url>
SUPABASE_PROJECT_REF=xztldvunnasjaxnzqpct
NEXT_PUBLIC_SUPABASE_URL=https://xztldvunnasjaxnzqpct.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TW1dRfU6xM4uxpt2jodk8w_AIO67EMq
SUPABASE_SECRET_KEY=<server-only-supabase-secret-key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<google-maps-api-key>
GOOGLE_MAP_SERVER_API_KEY=<server-side-google-key>
NEXT_PUBLIC_EMBED_API_URL=<embed-api-url>
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
SENTRY_AUTH_TOKEN=<sentry-auth-token>
SENTRY_ORG=omechu
SENTRY_PROJECT=omechu-fe
NEXT_PUBLIC_SITE_URL=https://omechu.log8.kr
```

`NEXT_PUBLIC_SUPABASE_*`는 브라우저/SSR용 공개 설정.
`SUPABASE_SECRET_KEY`는 서버 전용. 절대 클라이언트 코드나 공개 저장소에 넣지 말 것.

테스트 환경에선 `.env.test` 사용. `.env.local`에 의존하지 말 것.

## Image Handling

- S3 / Google Places (마이그레이션 시 Supabase Storage로 이전 예정)
- `next/image` + `remotePatterns` 등록
- 한글 파일명: NFC 정규화

## 리뉴얼 상태

- [x] FSD 4계층 + Public API barrel 강제
- [x] ESLint / Prettier / Husky / Commitlint / CI 정비
- [x] tsconfig strict 확장 (noUncheckedIndexedAccess 등)
- [x] Vitest / Playwright smoke 인프라
- [ ] Socket.IO 배틀 → Supabase Realtime
- [ ] JWT + Redis → Supabase Auth
- [ ] MySQL → Supabase Postgres
- [ ] S3 → Supabase Storage
- [ ] 개인화 추천 엔진 고도화
