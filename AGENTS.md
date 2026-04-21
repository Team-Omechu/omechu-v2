# Next.js 16

작업 전 반드시 `node_modules/next/dist/docs/`의 관련 문서를 읽을 것. 학습 데이터는 outdated — bundled docs가 source of truth.

# Omechu 작업 규칙

- 테스트용 환경변수는 `.env.test`. `.env.local`에 의존하지 말 것
- 모든 변경은 `pnpm validate` 통과 + 관련 유닛 테스트 작성
- 라우팅 / 인증 / 메타데이터 / app shell / 배포 동작 건드리면 `pnpm test:e2e`까지 실행
- `git commit --no-verify`, `git push --no-verify` 절대 금지
- 코드 스타일·Git 규칙은 `omechu-app/docs/CONVENTIONS.md` 참조
- 프로젝트 전반 가이드는 `CLAUDE.md` 참조
