# Code Conventions

> TypeScript/React 코드 스타일 및 Git 규칙을 정리합니다.

---

## Naming Conventions

### Files & Folders

| Type            | Convention          | Example                                |
| --------------- | ------------------- | -------------------------------------- |
| Folders         | kebab-case          | `user-profile/`, `question-answer/`    |
| Component files | PascalCase.tsx      | `UserCard.tsx`, `Header.tsx`           |
| Hook files      | use\*.ts            | `useAuth.ts`, `useProfile.ts`          |
| Store files     | \*.store.ts         | `auth.store.ts`, `onboarding.store.ts` |
| API files       | \*.api.ts or folder | `authApi.ts`, `api/profile.ts`         |
| Type files      | \*.types.ts         | `user.types.ts`, `menu.types.ts`       |
| Utility files   | camelCase.ts        | `formatDate.ts`, `validation.ts`       |

#### Folder rules (강제)

- `src/widgets/*`, `src/entities/*` 하위 슬라이스 폴더는 **반드시 kebab-case**.
  ESLint `check-file/folder-naming-convention` 규칙이 error로 차단.
  - OK: `src/widgets/login-modal/`, `src/entities/menu-battle/`
  - NG: `src/widgets/LoginModal/`, `src/entities/randomDraw/`
- 한 단어 슬라이스는 lowercase (`auth/`, `user/`, `menu/`) — kebab-case의 degenerate case.
- 각 슬라이스 내부 표준 폴더명 (`api/`, `model/`, `ui/`, `lib/`, `config/`, `constants/`, `types/`)은 고정.

#### App 라우트 네이밍

- 원칙: Next.js 라우트 세그먼트(`src/app/`)도 kebab-case.
  - OK: `menu-battle/`, `random-recommend/`, `account-setting/`, `question-answer/`
- **예외**: 한국 웹서비스 관례상 굳어진 이름은 no-separator lowercase 허용.
  - `mainpage/`, `mypage/` (URL로도 노출되는데 관례 우선)
- 새 라우트 추가 시 위 관례에 해당하지 않으면 기본값은 kebab-case.

### Variables & Functions

| Type             | Convention       | Example                         |
| ---------------- | ---------------- | ------------------------------- |
| Variables        | camelCase        | `userName`, `isLoading`         |
| Functions        | camelCase        | `fetchData()`, `handleSubmit()` |
| Components       | PascalCase       | `UserAvatar`, `LoginForm`       |
| Constants        | UPPER_SNAKE_CASE | `MAX_LIMIT`, `API_BASE_URL`     |
| Types/Interfaces | PascalCase       | `UserType`, `ProfileResponse`   |

### Method Naming

| Action      | Prefix                    | Example                           |
| ----------- | ------------------------- | --------------------------------- |
| 조회 (단건) | `get`, `fetch`            | `getUser()`, `fetchProfile()`     |
| 조회 (목록) | `get`, `fetch`, `search`  | `getUsers()`, `searchMenus()`     |
| 생성        | `create`, `add`           | `createUser()`, `addItem()`       |
| 수정        | `update`, `modify`        | `updateProfile()`                 |
| 삭제        | `delete`, `remove`        | `deleteUser()`, `removeItem()`    |
| 검증        | `validate`, `check`, `is` | `validateEmail()`, `isLoggedIn()` |

---

## Coding Conventions

### FSD Architecture Rules

#### Layer Hierarchy

```
app → widgets → entities → shared
```

- 상위 레이어는 하위 레이어만 import 가능
- 동일 레이어 간 import 금지
- 순환 의존성 금지

#### Directory Structure

```
src/
├── app/           # Next.js App Router (pages, layouts)
├── widgets/       # Complex UI blocks (여러 entities 조합)
├── entities/      # Business entities (user, menu, restaurant)
└── shared/        # Reusable code (ui, api, lib, config)
```

#### Route Group Structure

Next.js App Router의 Route Group을 활용하여 인증 여부에 따라 라우트를 분류합니다.

```
src/app/
├── (auth)/        # 인증 페이지 (로그인, 회원가입, 비밀번호 재설정)
├── (public)/      # 비로그인 접근 가능 (메인, 랜덤추천, 메뉴배틀)
├── (private)/     # 로그인 필수 → layout.tsx에서 ProtectedRoute 적용
│   ├── layout.tsx # ProtectedRoute로 children 감싸기
│   ├── mypage/
│   └── onboarding/
└── api/           # Next.js Route Handlers
```

| Route Group | 인증 필요 | 설명                                           |
| ----------- | --------- | ---------------------------------------------- |
| `(auth)`    | ✕         | 로그인/회원가입 등 인증 플로우 전용            |
| `(public)`  | ✕         | 비로그인 사용자도 접근 가능한 페이지           |
| `(private)` | ✔         | 로그인 필수, 미인증 시 `/login`으로 리다이렉트 |

**규칙:**

- 새 페이지 추가 시 반드시 `(public)` 또는 `(private)` 중 적절한 그룹에 배치
- `(private)` 그룹의 layout.tsx가 `ProtectedRoute`로 하위 전체를 보호하므로 개별 페이지에서 인증 체크 불필요
- Route Group은 URL에 영향을 주지 않음 (`/mypage`는 그대로 `/mypage`)

#### Entity Module Structure

```
entity/
├── api/          # API calls
├── model/        # State management (hooks, stores)
├── ui/           # Components
├── lib/          # Utils & helpers
├── types/        # Type definitions
└── index.ts      # Barrel exports
```

#### Import Rules

```typescript
// 절대 경로 사용 (권장)
import { useAuthStore } from "@/entities/user/model/auth.store";

import { Button } from "@/shared/ui/button/Button";

// 상대 경로는 같은 모듈 내에서만
import { formatDate } from "./utils";
```

---

### Code Style

#### TypeScript

```typescript
// 타입 정의는 interface 우선 사용
interface UserProps {
  name: string;
  age: number;
}

// 유니온 타입은 type 사용
type Status = "loading" | "success" | "error";

// 함수 컴포넌트
export function UserCard({ name, age }: UserProps) {
  return <div>{name}</div>;
}

// 훅
export function useUser(userId: string) {
  // ...
}
```

#### React

```tsx
// 컴포넌트 파일 구조
"use client"; // 필요한 경우
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthStore } from "@/entities/user/model/auth.store";

import { Button } from "@/shared/ui/button/Button";

interface Props {
  // ...
}

export function ComponentName({ ...props }: Props) {
  // hooks
  // state
  // effects
  // handlers
  // render
}
```

#### Import Order

1. React / Next.js
2. 외부 라이브러리
3. 내부 모듈 (@/\*)
4. 상대 경로

```typescript
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { useAuthStore } from "@/entities/user/model/auth.store";

import { Button } from "@/shared/ui/button/Button";

import { formatDate } from "./utils";
```

---

## Lint / Typecheck Policy

### 우회 금지 원칙

- `git commit --no-verify`, `git push --no-verify` **금지**
- `pre-push` 훅 SKIP 환경변수 **없음** (`LOCAL_PREPUSH_SKIP` 등 도입 금지)
- `@ts-ignore`, `@ts-nocheck`, `prettier-ignore` **사용 금지**. 필요 시 `@ts-expect-error`로 이유 주석 동반
- `eslint-disable`은 **인라인 + `-- reason` 주석** 의무 (라이브러리 한계 등 불가피할 때만)
- CI (`.github/workflows/ci.yml`)가 최종 게이트. 로컬 훅 우회해도 CI 실패로 드러남

### 현재 허용된 예외 (중앙집중, 파일 scatter 금지)

- `@typescript-eslint/no-explicit-any`: `src/shared/lib/axiosInstance.ts` 3곳
  - 사유: authStore ↔ axios circular dep 회피. `AuthStoreGetter<TUser = any>` 인터페이스 바운더리 필요
- `react-hooks/refs`: `react-hook-form`의 `handleSubmit` 호출 부 2곳
  - 사유: 라이브러리 내부 ref 접근이 설계 전제. `useWatch` 전환 완료 후에도 남는 불가피 케이스
- `react-hooks/set-state-in-effect`: **규칙 `off`**
  - 사유: 수동 페이지네이션, `react-query onSuccess → toast state` 등 데이터 sync 패턴과 충돌. 대안은 `useInfiniteQuery`/`useQuery select`로 점진적 마이그레이션 (일부 완료). 규칙 전체 off가 inline disable 스캐터보다 투명
- `react-hooks/incompatible-library`, `react-hooks/refs`: **warn**
  - 사유: 점진 개선 대상. react-hook-form → `useWatch`/`useController` 전환 완료한 파일부터 자동 해결

---

## Git Conventions

### Branch Naming

```
main                         # 운영
develop                      # 개발
<type>/<kebab-case-설명>      # 작업 브랜치
```

| 구성요소 | 설명            | 예시                                         |
| -------- | --------------- | -------------------------------------------- |
| `type`   | 작업 유형       | `feat`, `fix`, `refactor`, `chore`, `hotfix` |
| `설명`   | 영문 kebab-case | `signup-flow`, `restaurant-infinite-query`   |

예시: `feat/signup-flow`, `fix/nfc-normalization`, `refactor/fsd-barrel`

### Commit Message (Conventional Commits)

`.husky/commit-msg` → `commitlint`가 자동 검증. 형식:

```
<type>: <subject>

[body]
```

| Type       | 설명                    |
| ---------- | ----------------------- |
| `feat`     | 새로운 기능             |
| `fix`      | 버그 수정               |
| `docs`     | 문서                    |
| `refactor` | 기능 변화 없는 리팩토링 |
| `perf`     | 성능 개선               |
| `style`    | 포맷/공백 (UI 아님)     |
| `test`     | 테스트 추가·수정        |
| `build`    | 빌드/패키지 설정        |
| `ci`       | CI 설정                 |
| `chore`    | 기타 (설정, 패키지 등)  |
| `revert`   | 이전 커밋 되돌리기      |

**규칙**:

- `type` 소문자
- `subject` 한글/영문 혼용 가능, 50자 이내, 마침표 없음
- `body`는 선택 — 무엇을 **왜** 바꿨는지
- GitHub 이슈 쓰는 경우 `(#N)`로 subject 뒤 또는 body에 참조 (선택)

예시:

```
feat: 로그인 페이지 UI 구현

fix: 이미지 업로드 시 NFC 정규화 누락 수정

refactor: useGetRestaurants를 useInfiniteQuery로 전환

- 수동 page state + 누적 배열 제거
- react-hooks/set-state-in-effect 경고 해소
```

---
