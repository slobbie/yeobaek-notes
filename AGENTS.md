# 여백의 노트 Codex 작업 안내

## Product boundary

- `여백의 노트`의 공개 블로그만 Vercel에 배포한다.
- 관리자는 별도 로컬 앱으로만 실행한다. 배포 대상에 관리자 라우트, 관리자 키, 쓰기 API를 넣지 않는다.
- Supabase `service_role` 키는 로컬 관리자 환경 변수에만 둔다. 공개 앱은 RLS로 `published` 콘텐츠만 읽는다.

## Current stage and target structure

- 현재는 npm workspaces 기반 모노레포다. 공개 블로그는 `apps/web`, 로컬 관리자는 `apps/admin`, 콘텐츠 계약은 `packages/content`, 공용 UI와 토큰은 `packages/ui`에 둔다.
- 루트 `npm run dev`와 `npm run build`는 공개 블로그만 대상으로 한다. 관리자는 `npm run dev:admin`으로만 실행한다.
- 개발 순서는 `공개 블로그 → 로컬 관리자 → Supabase 백엔드 → 통합 검증 → 공개 배포`다. 앞 단계의 화면·콘텐츠 계약·디자인을 확정한 뒤 다음 단계로 진행한다.
- 루트에 새 `app/**`을 만들지 않는다. 공개 화면과 관리자 화면은 각 앱 안에 두고, 두 앱이 함께 쓰는 코드만 역할에 맞는 `packages/**`로 이동한다.
- 새 화면은 도메인 단위로 구성한다. 공용 UI와 토큰은 한 곳에서 관리하고, 화면에서 Supabase를 직접 호출하지 않는다.

## Working rules

1. 작업 전 아래 역할 중 하나를 정하고, 해당 역할 파일과 `.codex/HARNESS.md`만 추가로 읽는다. [확인 필요]
2. UI는 `packages/ui/**`의 토큰을 우선 사용한다. 화면마다 색상·간격·타이포 값을 새로 하드코딩하지 않는다. [문서 규칙]
3. 데이터 읽기·쓰기와 분석 이벤트는 데이터 경계에 둔다. 화면 컴포넌트가 Supabase 또는 HTTP를 직접 호출하지 않는다. [문서 규칙]
4. 새 사용자 동작은 사용자가 관찰할 결과를 검증한다. 구현 세부를 테스트 계약으로 고정하지 않는다. [테스트]
5. 분석 이벤트에는 이름, 속성, 수집 목적을 정의하고 개인 식별 정보·민감 정보는 수집하지 않는다. [문서 규칙]
6. 수정 후에는 변경 범위, 검증 결과, Git 상태를 구분해 보고한다. [문서 규칙]
7. staging, commit, push, 배포는 사용자가 명시적으로 요청할 때만 수행한다. [확인 필요]
8. 커밋 메시지와 PR은 각각 작업 단위와 전체 변경 단위의 신뢰할 수 있는 의사결정 문서다. 둘 모두 변경 이유, 범위, 검증 근거를 상세히 남기며 내용이 다르면 병합 전에 함께 정정한다. 상세 형식은 `docs/pull-request-conventions.md`를 따른다. [문서 규칙]
9. SEO와 GEO는 같은 기반 위에서 다룬다. 독자가 확인할 수 있는 원문성, 출처, 작성·수정 시점, 명확한 주장을 우선하며 AI 노출만을 위한 문장 쪼개기·숨은 텍스트·형식적인 FAQ·전용 파일을 만들지 않는다. [문서 규칙]
10. 모든 구현은 `develop`에서 만든 작업 브랜치에서 수행하고, 작업 단위로 커밋·PR·`develop` 병합까지 마친다. 병합이 확인된 작업 브랜치는 로컬과 원격에서 삭제한다. 브랜치 생성, staging, commit, push, PR 생성·병합·삭제는 사용자가 명시적으로 요청할 때만 실행한다. [확인 필요]

## Roles and scope

| Role | Responsibility | Primary paths |
| --- | --- | --- |
| frontend-architect | 앱 구조, 빌드, 공개/관리자 경계 | root config, app/package manifests, `tests/**` |
| frontend-dev | 공개·관리자 화면과 기능 | `apps/*/app/**` except data/UI paths |
| design-system-dev | 토큰과 공용 UI | `packages/ui/**`, app global styles |
| data-layer-dev | Supabase, 검증 스키마, analytics | `apps/*/app/lib/**`, `packages/content/**` |
| harness-architect | Codex·PR·SEO/GEO 규칙과 검사기 | `AGENTS.md`, `.codex/**`, `.github/**`, `docs/*-conventions.md`, `docs/implementation-plan.md` |
| code-reviewer | 명시 요청 시 읽기 전용 리뷰 | no write paths |

수정 전 역할 경계가 불명확하면 `.codex/checks/scope-check.sh --actor <role> --path <path>`로 확인한다.

## Related configuration

- Shared constraints: `.codex/HARNESS.md`
- Role details: `.codex/roles/*.md`
- Deterministic scope check: `.codex/checks/scope-check.sh`
- Commit and PR convention: `docs/pull-request-conventions.md`
- SEO and GEO convention: `docs/seo-geo-conventions.md`
- Branch and merge convention: `docs/pull-request-conventions.md`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
