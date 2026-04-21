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
- **Monitoring**: Sentry + Vercel Analytics + Speed Insights
- **Package Manager**: pnpm (강제 — `npm`/`yarn` 금지)
- **Deploy**: Vercel Hobby + Supabase Free (마이그레이션 진행 중)

## 디렉토리 구조

모든 커맨드는 `omechu-app/`에서 실행.

```
omechu-renewal/
├── omechu-app/              # Next.js app
│   ├── src/
│   ├── docs/CONVENTIONS.md  # 코드 스타일 + Git + Lint Policy
│   ├── eslint.config.mjs
│   ├── commitlint.config.mjs
│   └── ...
├── supabase/
│   └── functions/           # Deno edge functions
│       ├── _shared/         #   cors.ts, supabase.ts (admin/authed client)
│       ├── google-login/    #   Google OAuth code → Supabase 세션
│       ├── kakao-login/     #   Kakao OAuth code → Supabase 세션
│       ├── google-places/   #   Google Places proxy
│       └── withdraw/        #   회원 탈퇴
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

pnpm validate        # lint + typecheck + format:check
pnpm validate:ci     # = validate (CI용)
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

Supabase Auth 기반. 소셜 로그인(Google/Kakao)은 **Supabase 네이티브 provider 대신 Edge Function 경로** 사용.

### 이유

Supabase 네이티브 OAuth 를 쓰면 리다이렉트 체인에 `<project-ref>.supabase.co` 가 노출된다. 포폴 도메인 일관성(`omechu.log8.kr` 단일화)을 위해 edge function 통일 방식 채택. Custom domain(Supabase Pro $25/mo) 대체재.

### 구성

| 역할 | 경로 |
|---|---|
| FE Google 진입 | `entities/user/api/supabaseAuth.ts` · `beginGoogleLogin()` |
| FE 콜백 | `app/auth/google/callback/page.tsx`, `app/auth/kakao/callback/page.tsx` |
| Edge Function | `supabase/functions/google-login/index.ts`, `supabase/functions/kakao-login/index.ts` |
| 이메일 매직링크 콜백 | `app/auth/callback/route.ts` (소셜 아님) |
| 세션 스토어 | Zustand persist (`auth.store.ts`) + Supabase client 세션 |
| 보호 라우팅 | `app/(private)/layout.tsx` `ProtectedRoute` |

### Flow (Google/Kakao 동일)

```
FE authorize URL → IDP → FE /auth/{provider}/callback?code=...
→ POST edge function(code, redirectUri)
→ edge: token exchange + userinfo + admin.createUser + generateLink(magiclink) + verifyOtp
→ FE setSession(access/refresh)
```

### 운영 체크리스트

1. Google/Kakao 콘솔 리다이렉트 URI 에 `https://omechu.log8.kr/auth/{provider}/callback` 등록.
2. Supabase Dashboard의 Google/Kakao provider 는 **OFF** 유지 (edge function 과 충돌 방지).
3. Edge function 시크릿은 `supabase secrets set` 으로 등록, `.env*` 값은 문서·로컬 테스트용.

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

| 키 | 범위 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | public | 레거시 백엔드 base URL (마이그레이션 중) |
| `SUPABASE_PROJECT_REF` · `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Supabase 클라이언트 초기화 |
| `SUPABASE_SECRET_KEY` | server | Supabase service role (서버 전용) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` · `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | public | Google authorize URL 구성 (FE) |
| `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET` | server (edge) | `google-login` edge function 토큰 교환 |
| `NEXT_PUBLIC_KAKAO_REDIRECT_URI` · `NEXT_PUBLIC_KAKAO_JS_KEY` | public | Kakao authorize/JS SDK |
| `KAKAO_REST_API_KEY` · `KAKAO_CLIENT_SECRET` | server (edge) | `kakao-login` edge function 토큰 교환 |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` · `GOOGLE_MAP_SERVER_API_KEY` | split | 클라 지도 / 서버 proxy |
| `NEXT_PUBLIC_SITE_URL` | public | SEO canonical |
| `NEXT_PUBLIC_SENTRY_DSN` · `SENTRY_*` | mixed | Sentry |
| `NEXT_PUBLIC_GA_ID` | public | GA4 측정 ID (`G-XXXXXXXXXX`) |

- `NEXT_PUBLIC_*` 는 브라우저 번들 포함 → 공개값만.
- `SUPABASE_SECRET_KEY`, `GOOGLE_CLIENT_SECRET`, `KAKAO_CLIENT_SECRET`, `SENTRY_AUTH_TOKEN` 은 서버 전용. 커밋 금지.
- Edge function 시크릿은 `.env*` 가 아니라 `supabase secrets set` 으로 등록한다. `.env*` 의 값은 문서·로컬 재현용.

샘플은 `omechu-app/.env.example` 참고.

## Image Handling

- S3 / Google Places (마이그레이션 시 Supabase Storage로 이전 예정)
- `next/image` + `remotePatterns` 등록
- 한글 파일명: NFC 정규화

## 리뉴얼 상태

- [x] FSD 4계층 + Public API barrel 강제
- [x] ESLint / Prettier / Husky / Commitlint / CI 정비
- [x] tsconfig strict 확장 (noUncheckedIndexedAccess 등)
- [x] JWT + Redis → Supabase Auth (이메일/OTP + Edge Function 기반 Google/Kakao)
- [ ] Socket.IO 배틀 → Supabase Realtime
- [ ] MySQL → Supabase Postgres
- [ ] S3 → Supabase Storage
- [ ] 개인화 추천 엔진 고도화
