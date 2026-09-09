# 여백의 노트 구현 계획

## 운영 원칙

- 상태는 `대기 → 진행 중 → PR 검토 → 병합됨` 순서로만 바꾼다. 한 번에 `진행 중`인 작업은 하나다.
- 모든 일반 작업은 최신 `develop`에서 `type/짧은-작업명` 브랜치로 분기하고, `develop`을 base로 PR을 연다.
- PR을 병합한 뒤에만 다음 작업을 시작한다. PR에는 변경 이유, 제외 범위, 검증 결과, SEO/GEO·접근성·분석 영향을 남긴다.
- DB는 마지막 단계에서만 연결한다. 그 전에는 fixture 또는 로컬 콘텐츠를 사용하며, 화면이 Supabase에 직접 의존하지 않게 한다.

## 0. 저장소 기준점

| ID | 상태 | 작업 | 브랜치·PR | 완료 조건 | 검증 |
| --- | --- | --- | --- | --- | --- |
| R-00 | 대기 | 현재 프로토타입·규칙을 첫 기준점으로 확정 | 예외: 빈 저장소이므로 `develop`에 기준 커밋 후 `main` 생성 | `develop`과 `main`이 같은 기준 커밋을 가리키고 origin에 존재 | build, 테스트, hooks, 원격 브랜치 확인 |

`R-00`만 빈 저장소를 초기화하기 위한 예외다. 이후 작업은 모두 PR 병합을 거친다.

## 1. 공개 블로그

| 순서 | ID | 상태 | 작업 | 권장 브랜치 | PR 제목 | 완료 조건 | 검증 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | W-01 | PR 검토 | Next.js App Router 공개 웹 기반으로 전환 | `build/public-next-foundation` | `build(blog): Next.js 공개 웹 기반을 구성한다` | Vite 의존성 없이 로컬 실행·production build가 되고, 공개 앱만 Vercel 배포 대상이다 | build, 기본 페이지 수동 확인 |
| 2 | W-02 | 대기 | 콘텐츠 계약과 fixture 분리 | `feat/content-contract` | `feat(content): 공개 글 콘텐츠 계약을 정의한다` | 글의 slug·제목·요약·날짜·분야·형식·태그·출처·수정 정보가 한 계약으로 관리된다 | 계약 단위 테스트, 목록 렌더링 |
| 3 | W-03 | 대기 | 최신순 아카이브 완성 | `feat/archive-experience` | `feat(blog): 최신순 글 모아보기를 완성한다` | 현재 디자인의 분야·형식·검색·빈 결과·모바일 레이아웃이 실제 Next 화면에서 동작한다 | 키보드·검색·필터·반응형 수동 확인 |
| 4 | W-04 | 대기 | 글 상세 페이지와 출처 블록 | `feat/post-detail` | `feat(blog): 글 상세 페이지를 추가한다` | slug별 고유 페이지, 발행·수정일, 태그, 읽기 시간, 출처·기준 시점이 보인다 | 정적 경로·404·출처 표시 확인 |
| 5 | W-05 | 대기 | 소개·편집 원칙 페이지 | `feat/editorial-pages` | `feat(blog): 소개와 편집 원칙 페이지를 추가한다` | 익명 브랜드의 주제 범위, 수정 원칙, 문의 경로를 공개하고 콘텐츠 책임 주체를 설명한다 | 링크·문서 구조·모바일 확인 |
| 6 | W-06 | 대기 | SEO·GEO 공개 표면 | `feat/seo-geo-surface` | `feat(seo): 공개 글의 검색 메타데이터를 구성한다` | title, description, canonical, OG, `BlogPosting`, `WebSite`, sitemap, RSS, robots가 실제 공개 정보와 일치한다 | metadata 스냅샷, JSON-LD/Rich Results Test, sitemap 확인 |
| 7 | W-07 | 대기 | 분석 이벤트 계약과 관찰 화면 | `feat/analytics-foundation` | `feat(analytics): 공개 블로그 행동 지표 기반을 추가한다` | 조회·검색·필터 이벤트의 목적·속성·보존 방침이 문서화되고 PII 없이 전송된다 | 이벤트 단위 테스트, 브라우저 관찰 |
| 8 | W-08 | 대기 | 공개 배포 품질 게이트 | `ci/public-quality-gate` | `ci(blog): 공개 배포 품질 게이트를 추가한다` | 접근성·빌드·핵심 경로·메타데이터 검증을 PR에서 재현 가능하게 실행한다 | CI 실행 결과, 실패 케이스 확인 |
| 9 | W-09 | 대기 | Vercel 공개 배포 | `ci/vercel-public-deploy` | `ci(blog): 공개 블로그 배포를 연결한다` | 공개 앱만 Vercel에 배포되며 관리자 코드·비밀 키는 번들에 없다 | preview/production 배포, robots·sitemap 확인 |

## 2. 로컬 전용 관리자

| 순서 | ID | 상태 | 작업 | 권장 브랜치 | PR 제목 | 완료 조건 | 검증 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | A-01 | 대기 | 웹·관리자·공용 콘텐츠 구조 분리 | `refactor/admin-workspace` | `refactor(repo): 공개 웹과 로컬 관리자를 분리한다` | `apps/web`, `apps/admin`, `packages/content`, `packages/ui`가 역할별로 나뉘고 공개 번들에 admin이 없다 | 각 앱 build, 공개 번들 점검 |
| 11 | A-02 | 대기 | 로컬 관리자 접근 경계 | `feat/admin-local-access` | `feat(admin): 로컬 관리자 접근 경계를 구성한다` | 관리자는 로컬 실행만 가능하고 Vercel 경로·번들·환경 변수에서 제외된다 | 로컬 접근·공개 앱 차단 확인 |
| 12 | A-03 | 대기 | 글 작성·편집 UI | `feat/admin-post-editor` | `feat(admin): 글 작성과 편집 화면을 추가한다` | 제목, slug, 요약, 본문, 분야, 형식, 태그, 출처, 발행·수정 정보를 입력·검증한다 | 폼 검증, 임시 저장·미리보기 수동 확인 |
| 13 | A-04 | 대기 | 발행 전 SEO·GEO 검사 UI | `feat/admin-content-check` | `feat(admin): 발행 전 콘텐츠 검사를 추가한다` | 필수 메타데이터, 출처·기준 시점, slug 중복, 공개 메타데이터 미리보기를 확인한다 | 오류·정상 사례 수동 확인 |

## 3. Supabase 백엔드

| 순서 | ID | 상태 | 작업 | 권장 브랜치 | PR 제목 | 완료 조건 | 검증 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 14 | B-01 | 대기 | Supabase 스키마·마이그레이션·RLS | `feat/db-content-schema` | `feat(db): 발행 콘텐츠 스키마와 RLS를 추가한다` | posts, metadata, sources, analytics 계약과 published 읽기 정책·관리자 쓰기 정책이 마이그레이션으로 재현된다 | migration, RLS 허용·거부 테스트 |
| 15 | B-02 | 대기 | 공개 웹 읽기 저장소 연결 | `feat/web-content-repository` | `feat(content): 공개 글 저장소를 Supabase에 연결한다` | 공개 앱은 published 콘텐츠만 읽고, fixture를 제거해도 목록·상세·SEO 표면이 유지된다 | repository 테스트, 비공개 글 차단 |
| 16 | B-03 | 대기 | 로컬 관리자 쓰기 저장소 연결 | `feat/admin-content-repository` | `feat(admin): 로컬 관리자 콘텐츠 저장소를 연결한다` | service role은 로컬 환경에서만 사용하고 draft·publish·update가 감사 가능한 계약으로 동작한다 | 환경 변수 누출 점검, CRUD·권한 테스트 |
| 17 | B-04 | 대기 | 지표 저장·조회 연결 | `feat/analytics-persistence` | `feat(analytics): 블로그 지표 저장과 조회를 연결한다` | 정의된 비식별 이벤트만 저장하고 관리자에서 기간·글·유입 기준으로 확인할 수 있다 | 이벤트 적재·집계·보존 정책 테스트 |
| 18 | B-05 | 대기 | 운영 전환 점검 | `chore/production-readiness` | `chore(repo): 공개 운영 전환을 점검한다` | 보안, RLS, 성능, 접근성, SEO/GEO, 백업·되돌리기 절차를 검증하고 운영 기준을 PR에 남긴다 | production checklist, 배포 후 재검증 |

## 지금 할 일

첫 실행 작업은 `R-00`이다. 기준 커밋을 만든 뒤 `main`을 같은 지점에 만들고 원격에 올려야 이후 `develop` 기반 PR 흐름을 시작할 수 있다. 이 작업은 현재 모든 파일이 아직 미추적 상태이므로, 커밋에 포함할 파일 목록을 먼저 PR 수준으로 검토한 뒤 진행한다.
