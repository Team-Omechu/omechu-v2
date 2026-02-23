# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Overview

Omechu (오메추 - "오늘 뭐 먹지?") is a food recommendation web application that provides personalized menu and restaurant recommendations based on user preferences, context, and conditions.

## Development Commands

All commands run from `omechu-app/` directory:

```bash
pnpm dev          # Development server at http://localhost:3000
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint (uses eslint.config.mjs)
pnpm format       # Prettier formatting
pnpm format:check # Check formatting
pnpm prepare      # Install Husky hooks
```

## Technology Stack

- **Framework**: Next.js 16 with App Router, React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 (CSS-first config in `globals.css`)
- **State**: Zustand (client), TanStack React Query (server)
- **Forms**: React Hook Form + Zod
- **API**: Axios with JWT auth interceptors
- **Monitoring**: Sentry + Vercel Analytics + Vercel Speed Insights
- **Package Manager**: pnpm (see `omechu-app/package.json`)

## Project Architecture (FSD)

The project uses **Feature-Sliced Design** architecture:

```
omechu-app/src/
├── app/           # Next.js App Router pages and layouts
├── widgets/       # Complex UI blocks (can import from entities, shared)
├── entities/      # Business entities (user, menu, restaurant, etc.)
└── shared/        # Reusable code (ui, api, lib, config, store)
```

### FSD Layer Rules

- **Layer hierarchy**: app → widgets → entities → shared
- Higher layers can only import from lower layers
- No circular dependencies or same-level imports
- Use barrel exports (`index.ts`) for cross-layer imports

### Path Aliases (tsconfig.json)

```typescript
"@/*"         → "./src/*"
"@/app/*"     → "./src/app/*"
"@/entities/*"→ "./src/entities/*"
"@/widgets/*" → "./src/widgets/*"
"@/shared/*"  → "./src/shared/*"
```

### Entity Module Structure

```
entity/
├── api/          # API calls
├── model/        # State management (hooks, stores)
├── ui/           # Components
├── lib/          # Utils & helpers
├── types/        # Type definitions
└── index.ts      # Barrel exports
```

## Core Architecture Patterns

### Authentication

- JWT-based with automatic token refresh
- Access token in Zustand store (persisted to localStorage)
- Axios interceptor handles 401 errors with token refresh queue
- Client-side route protection in `ClientLayout.tsx`
- `proxy.ts` handles URL rewrites only (no auth enforcement)

Key files:

- Auth store: `omechu-app/src/entities/user/model/auth.store.ts`
- Axios instance: `omechu-app/src/shared/lib/axiosInstance.ts`

### State Management

**Zustand stores** (with persist middleware):

- `auth.store.ts` - Authentication state
- `onboarding.store.ts` - Multi-step onboarding flow
- `tagData.store.ts` - Food preference tags
- `questionAnswer.store.ts` - Recommendation questionnaire
- `userInfoSetup.store.ts` - User profile setup

### API Layer

- Centralized Axios instance with interceptors
- Base URL from `NEXT_PUBLIC_API_URL`
- Response format: `{ resultType, error, success }`
- React Query for caching/mutations

### Styling (Tailwind CSS v4)

CSS-first configuration in `omechu-app/src/app/globals.css`:

- All theme customization in `@theme` block
- Custom utilities via `@utility` directive
- Mobile-first: 375px fixed width layout
- Korean typography (Noto Sans KR)

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
```

## Important Notes

### Zod v4 Syntax

```typescript
// Correct v4 syntax:
z.enum(["a", "b"], { message: "error" });
// NOT: z.enum(["a", "b"], { errorMap: () => ({ message: "error" }) })
```

### Date Libraries

Both `dayjs` and `date-fns` are installed. Prefer `date-fns` for new code.

### Image Handling

- AWS S3 for uploads
- Next.js Image with `remotePatterns` configured
- NFC normalization for Korean filenames

### Code Quality

- ESLint 9 flat config (`omechu-app/eslint.config.mjs`)
- Import ordering: React → Next → Internal (@/\*) → Relative
- Husky pre-commit hooks run lint-staged (root `.husky`)

## Git Conventions

See `omechu-app/docs/CONVENTIONS.md`.
