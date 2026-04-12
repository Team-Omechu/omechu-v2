# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Overview

Omechu (오메추 - "오늘 뭐 먹지?") is a food recommendation web application that provides personalized menu and restaurant recommendations based on user preferences, context, and conditions.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 (CSS-first config in `globals.css`)
- **State**: Zustand (client), TanStack React Query (server)
- **Forms**: React Hook Form + Zod 4
- **API**: Axios with JWT auth interceptors
- **Monitoring**: Sentry + Vercel Analytics + Vercel Speed Insights
- **Package Manager**: pnpm (only — `npm`/`yarn` 금지)

## Scripts

All commands run from `omechu-app/` directory:

```bash
pnpm dev          # 개발 서버 (Turbopack) — http://localhost:3000
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm lint         # ESLint 검사
pnpm lint:fix     # ESLint 자동 수정
pnpm format       # Prettier 포맷팅
pnpm format:check # Prettier 검사만
pnpm typecheck    # TypeScript 타입 검사
pnpm validate     # lint + typecheck + format 전체 검증
pnpm prepare      # Husky hooks 설치
```

## Architecture — FSD 4-Layer

```
omechu-app/src/
├── app/           # Next.js App Router — pages, layouts, route handlers
├── widgets/       # 조합형 UI 블록 (Header, BottomNav 등)
├── entities/      # 비즈니스 엔티티 (user, menu, restaurant 등)
└── shared/        # 공용 레이어
    ├── api/       # Axios instance, fetch 유틸
    ├── config/    # 상수, 메뉴 설정
    ├── constants/ # 사이트 상수 (URL, 테마 등)
    ├── lib/       # 유틸리티
    ├── store/     # Zustand stores
    └── ui/        # 디자인 시스템 컴포넌트
```

### Import Rules (엄격)

```
app → widgets, entities, shared
widgets → entities, shared
entities → shared
shared → (external packages only)
```

- **상위 레이어가 하위 레이어를 import**: OK
- **하위 레이어가 상위 레이어를 import**: NEVER — ESLint가 error로 차단
- **같은 레이어 간 cross-import**: NEVER

### Path Aliases (tsconfig.json)

```typescript
"@/*"          → "./src/*"
"@/app/*"      → "./src/app/*"
"@/entities/*" → "./src/entities/*"
"@/widgets/*"  → "./src/widgets/*"
"@/shared/*"   → "./src/shared/*"
```

### Entity Module Structure

```
entity/
├── api/          # API calls
├── model/        # State management (hooks, stores)
├── ui/           # Components
├── lib/          # Utils & helpers
├── types/        # Type definitions
└── index.ts      # Barrel exports (cross-layer import 진입점)
```

## Code Conventions

### File Naming

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 (.tsx) | PascalCase | `MenuCard.tsx`, `UserProfile.tsx` |
| Next.js 예약 파일 | lowercase | `page.tsx`, `layout.tsx`, `loading.tsx` |
| 훅 | camelCase (use 접두사) | `useAuth.ts`, `useMenuList.ts` |
| 유틸/라이브러리 | camelCase | `axiosInstance.ts`, `formatDate.ts` |
| 타입 | camelCase | `menu.ts`, `user.ts` |

ESLint `check-file` 플러그인이 자동으로 강제함.

### Component Rules

- **function declaration** 사용 (arrow function export 금지)
- `'use client'`는 필요한 곳에만 최소한으로
- Server Component 우선

```tsx
// Good
export default function MenuCard({ name }: MenuCardProps) {
  return <div>{name}</div>;
}

// Bad
const MenuCard = ({ name }: MenuCardProps) => <div>{name}</div>;
export default MenuCard;
```

### Import Ordering (Prettier 자동 정렬)

```typescript
// 1. React / Next.js
import { useState } from "react";
import Image from "next/image";

// 2. 외부 패키지
import { useQuery } from "@tanstack/react-query";

// 3. 내부 레이어 (FSD 순서)
import { SomeWidget } from "@/widgets/some-widget";
import { useAuth } from "@/entities/user";
import { Button } from "@/shared/ui";

// 4. 상대 경로
import { helper } from "./helper";
```

Prettier commit 시 자동 정렬. 수동으로 순서 맞출 필요 없음.

### Styling

- Tailwind 유틸리티 클래스 사용
- 인라인 스타일 금지
- `cn()` (`clsx` + `tailwind-merge`) 으로 조건부 클래스 병합
- CVA로 variants 관리 (`shared/ui` 컴포넌트)
- 모바일 고정 레이아웃: `max-w-120 min-w-93.75` (375px 기준)

### Error Handling

- `console.log` 금지 — `console.warn`, `console.error`만 허용 (ESLint 강제)
- API 에러는 명시적으로 처리
- `any` 타입 최소화 (ESLint warn)

## Core Architecture Patterns

### Authentication

- JWT-based with automatic token refresh
- Access token in Zustand store (persisted to localStorage)
- Axios interceptor handles 401 errors with token refresh queue
- Client-side route protection in `ClientLayout.tsx`

Key files:
- Auth store: `src/entities/user/model/auth.store.ts`
- Axios instance: `src/shared/lib/axiosInstance.ts`

### State Management

**Zustand stores** (with persist middleware):
- `auth.store.ts` — Authentication state
- `onboarding.store.ts` — Multi-step onboarding flow
- `tagData.store.ts` — Food preference tags
- `questionAnswer.store.ts` — Recommendation questionnaire
- `userInfoSetup.store.ts` — User profile setup

### API Layer

- Centralized Axios instance with interceptors
- Base URL from `NEXT_PUBLIC_API_URL`
- Response format: `{ resultType, error, success }`
- React Query for caching/mutations
- `fetchJSON` 유틸: resultType 래핑 자동 처리, 404 → `[]` 반환

### Zod v4 Syntax

```typescript
// v4 정확한 문법
z.enum(["a", "b"], { message: "에러 메시지" });
// 틀린 문법 (v3)
z.enum(["a", "b"], { errorMap: () => ({ message: "..." }) });
```

## Git Strategy

- **브랜치**: `develop` → `main` PR 방식
- **커밋**: pre-commit hook이 자동 검증 후 커밋
- **커밋 메시지**: `type: 설명` (한국어/영어 혼용 가능)

### Pre-commit 검증 체인

```
1. eslint --fix       (lint + auto-fix)
2. prettier --write   (format)
3. tsc --noEmit       (type check)
```

세 단계 모두 통과해야 커밋 가능. `git commit --no-verify` 사용 금지.

## Code Quality Gates

| 도구 | 역할 | 레벨 |
|------|------|------|
| ESLint (check-file) | 파일명 컨벤션 | warn |
| ESLint (FSD rules) | 레이어 import 위반 | error |
| ESLint (eqeqeq) | `==` 사용 | error |
| ESLint (no-console) | console.log | warn |
| ESLint (prettier) | 포맷 불일치 | error |
| tsc --noEmit | 타입 에러 | error |

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=<backend-api-url>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<google-maps-api-key>
GOOGLE_MAP_SERVER_API_KEY=<google-map-server-api-key>
NEXT_PUBLIC_EMBED_API_URL=<embed-api-url>
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
SENTRY_AUTH_TOKEN=<sentry-auth-token>
SENTRY_ORG=omechu
SENTRY_PROJECT=omechu-fe
NEXT_PUBLIC_SITE_URL=https://omechu.log8.kr
```

## Image Handling

- AWS S3 for uploads
- Next.js `<Image>` with `remotePatterns` configured
- Korean filenames: NFC normalization 필요
