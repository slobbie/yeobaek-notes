# 여백의 노트 Codex 작업 안내

## Product boundary

- `여백의 노트`의 공개 블로그만 Vercel에 배포한다.
- 관리자는 별도 로컬 앱으로만 실행한다. 배포 대상에 관리자 라우트, 관리자 키, 쓰기 API를 넣지 않는다.
- Supabase `service_role` 키는 로컬 관리자 환경 변수에만 둔다. 공개 앱은 RLS로 `published` 콘텐츠만 읽는다.

## Current stage and target structure

- 현재는 루트 `src/**`의 공개 블로그 프로토타입 단계다.
- 개발 순서는 `공개 블로그 → 로컬 관리자 → Supabase 백엔드`다. 앞 단계의 화면·콘텐츠 계약·디자인을 확정한 뒤 다음 단계로 진행한다.
- 공개 블로그와 관리자를 만들기 시작하는 구조 전환 작업에서만 `apps/web`, `apps/admin`, `packages/content`, `packages/ui`로 이동한다.
- 구조 전환 전에는 새로운 앱 루트나 패키지 경로를 임의로 만들지 않는다.
- 새 화면은 도메인 단위로 구성한다. 공용 UI와 토큰은 한 곳에서 관리하고, 화면에서 Supabase를 직접 호출하지 않는다.

## Working rules

1. 작업 전 아래 역할 중 하나를 정하고, 해당 역할 파일과 `.codex/HARNESS.md`만 추가로 읽는다. [확인 필요]
2. UI는 `src/styles.css`의 토큰을 우선 사용한다. 화면마다 색상·간격·타이포 값을 새로 하드코딩하지 않는다. [문서 규칙]
3. 데이터 읽기·쓰기와 분석 이벤트는 데이터 경계에 둔다. 화면 컴포넌트가 Supabase 또는 HTTP를 직접 호출하지 않는다. [문서 규칙]
4. 새 사용자 동작은 사용자가 관찰할 결과를 검증한다. 구현 세부를 테스트 계약으로 고정하지 않는다. [테스트]
5. 분석 이벤트에는 이름, 속성, 수집 목적을 정의하고 개인 식별 정보·민감 정보는 수집하지 않는다. [문서 규칙]
6. 수정 후에는 변경 범위, 검증 결과, Git 상태를 구분해 보고한다. [문서 규칙]
7. staging, commit, push, 배포는 사용자가 명시적으로 요청할 때만 수행한다. [확인 필요]
8. PR은 변경 이유, 범위, 검증 근거, 위험을 남기는 가장 신뢰할 수 있는 변경 문서다. 코드·커밋·PR 설명이 다르면 검증 근거가 있는 PR 설명을 기준으로 정정한다. [문서 규칙]
9. SEO와 GEO는 같은 기반 위에서 다룬다. 독자가 확인할 수 있는 원문성, 출처, 작성·수정 시점, 명확한 주장을 우선하며 AI 노출만을 위한 문장 쪼개기·숨은 텍스트·형식적인 FAQ·전용 파일을 만들지 않는다. [문서 규칙]
10. 모든 구현은 `develop`에서 만든 작업 브랜치에서 수행하고, 작업 단위로 커밋·PR·`develop` 병합까지 마친다. 브랜치 생성, staging, commit, push, PR 생성·병합은 사용자가 명시적으로 요청할 때만 실행한다. [확인 필요]

## Roles and scope

| Role | Responsibility | Primary paths |
| --- | --- | --- |
| frontend-architect | 앱 구조, 빌드, 공개/관리자 경계 | root config, future `apps/**` |
| frontend-dev | 공개·관리자 화면과 기능 | `src/**`, future `apps/**` |
| design-system-dev | 토큰과 공용 UI | `src/styles.css`, future `packages/ui/**` |
| data-layer-dev | Supabase, 검증 스키마, analytics | `src/lib/**`, future `packages/content/**` |
| harness-architect | Codex·PR·SEO/GEO 규칙과 검사기 | `AGENTS.md`, `.codex/**`, `.github/**`, `docs/*-conventions.md` |
| code-reviewer | 명시 요청 시 읽기 전용 리뷰 | no write paths |

수정 전 역할 경계가 불명확하면 `.codex/checks/scope-check.sh --actor <role> --path <path>`로 확인한다.

## Related configuration

- Shared constraints: `.codex/HARNESS.md`
- Role details: `.codex/roles/*.md`
- Deterministic scope check: `.codex/checks/scope-check.sh`
- Commit and PR convention: `docs/pull-request-conventions.md`
- SEO and GEO convention: `docs/seo-geo-conventions.md`
- Branch and merge convention: `docs/pull-request-conventions.md`
