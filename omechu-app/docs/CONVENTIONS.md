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
import { Button } from "@/shared/ui/button/Button";
import { useAuthStore } from "@/entities/user/model/auth.store";

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

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button/Button";
import { useAuthStore } from "@/entities/user/model/auth.store";

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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { Button } from "@/shared/ui/button/Button";
import { useAuthStore } from "@/entities/user/model/auth.store";

import { formatDate } from "./utils";
```

---

## Git Conventions

### Branch Naming

#### 브랜치 구조

```
main                        # 운영 브랜치
develop                     # 개발 브랜치
<type>/<설명>-#<issue>       # 작업 브랜치
```

#### 형식

```
<type>/<간단한_설명>-#<issue_number>
```

| 구성요소       | 설명                                | 예시                                |
| -------------- | ----------------------------------- | ----------------------------------- |
| `type`         | 작업 유형                           | `feat`, `fix`, `refactor`, `hotfix` |
| `설명`         | 간단한 작업 설명 (영문, 케밥케이스) | `signup-api`, `image-upload`        |
| `issue_number` | GitHub 이슈 번호 **(필수)**         | `#14`, `#23`, `#218`                |

#### 예시

```bash
feat/signup-api-#14          # 회원가입 API 기능 추가
fix/image-upload-#23         # 이미지 업로드 버그 수정
refactor/proxy-layout-#218   # proxy 마이그레이션
hotfix/auth-bug-#45          # 인증 관련 긴급 버그 수정
chore/docker-setup-#5        # Docker 환경 설정
```

---

### Commit Message

#### 형식

```
<type>: <subject> (#<issue_number>)

<body>
```

#### 커밋 유형 (Type)

| Type       | 설명                            |
| ---------- | ------------------------------- |
| `feat`     | 새로운 기능 추가                |
| `fix`      | 버그 수정                       |
| `docs`     | 문서 수정                       |
| `refactor` | 코드 리팩토링                   |
| `style`    | UI 스타일 수정 (기능 변경 없음) |
| `chore`    | 빌드 설정, 패키지 매니저 등     |
| `rename`   | 파일/폴더 이름 변경 또는 이동   |
| `remove`   | 파일 삭제                       |

#### 규칙

1. **type**: 소문자 영문
2. **subject**: 한글 또는 영문, 50자 이내, 마침표 없음
3. **body**: 한글 작성 권장, 무엇을 왜 변경했는지 설명
4. **이슈 번호**: 가능하면 포함

#### 예시

```bash
# 간단한 커밋
feat: 로그인 페이지 UI 구현 (#12)

# 본문 포함 커밋
feat: 소셜 로그인 기능 추가 (#28)

- 카카오 OAuth2 로그인 구현
- 이메일 로그인 폼 추가
- 토큰 저장 로직 구현

# 버그 수정
fix: 이미지 업로드 시 NFC 정규화 누락 수정 (#45)

# 리팩토링
refactor: BottomNavigation 제거 및 ClientLayout 정리 (#218)
```

---

### Issue & PR 연동

- 브랜치 생성 시 반드시 이슈 먼저 생성
- 브랜치명에 이슈 번호 필수 포함
- 커밋 메시지에 이슈 번호 포함 권장
- PR 머지 시 이슈 자동 종료: `Closes #14`, `Fixes #14`

---
