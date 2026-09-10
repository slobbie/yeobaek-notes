# 여백의 노트 구현 계획

## 운영 원칙

- 상태는 `대기 → 진행 중 → PR 검토 → 병합됨` 순서로만 바꾼다. 한 번에 `진행 중`인 작업은 하나다.
- 모든 일반 작업은 최신 `develop`에서 `type/짧은-작업명` 브랜치로 분기하고, `develop`을 base로 PR을 연다.
- 구현 결과를 사용자에게 보여주고 컨펌받은 뒤에만 staging, commit, push, PR 생성·병합을 진행한다.
- PR을 병합하고 작업 브랜치를 삭제한 뒤에만 다음 작업을 시작한다.
- 개발 순서는 `공개 블로그 → 로컬 관리자 → Supabase 백엔드 → 통합 검증 → 공개 배포`다.
- DB 연결 전에는 fixture 또는 로컬 콘텐츠를 사용하고 화면이 Supabase에 직접 의존하지 않게 한다.

## 0. 저장소 기준점

| ID | 상태 | 작업 | 완료 조건 |
| --- | --- | --- | --- |
| R-00 | 병합됨 | 저장소·규칙·`develop`·`main` 기준점 구성 | 두 통합 브랜치와 Git 작업 규칙이 원격 저장소에 존재한다. |

## 1. 공개 블로그

| 순서 | ID | 상태 | 작업 | 권장 브랜치 | PR 제목 | 완료 조건 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | W-01 | 병합됨 | Next.js App Router 공개 웹 기반 | `build/public-next-foundation` | `build(blog): Next.js 공개 웹 기반을 구성한다` | 공개 블로그가 로컬과 프로덕션 빌드에서 실행된다. |
| 2 | W-02 | 병합됨 | 콘텐츠 계약과 fixture 분리 | `feat/content-contract` | `feat(content): 공개 글 콘텐츠 계약을 정의한다` | 화면과 데이터 경계가 분리된다. |
| 3 | W-03 | 병합됨 | 최신순 글 목록과 검색 | `feat/archive-experience` | `feat(blog): 최신순 글 모아보기를 완성한다` | 주제·검색·빈 결과가 반응형 화면에서 동작한다. |
| 4 | W-04 | 병합됨 | 글 상세와 출처 | `feat/post-detail` | `feat(blog): 글 상세 페이지를 추가한다` | 글마다 고유 페이지와 날짜·주제·태그·출처가 표시된다. |
| 5 | W-05 | 병합됨 | 간결한 소개 페이지 | `feat/editorial-pages` | `feat(blog): 소개 페이지를 추가한다` | 사용자가 확정한 소개 문장만 반응형으로 표시된다. |
| 6 | W-06 | 병합됨 | SEO·GEO 공개 표면 | `feat/seo-geo-surface` | `feat(seo): 공개 글의 검색 메타데이터를 구성한다` | canonical, Open Graph, 구조화 데이터, sitemap, RSS, robots가 공개 정보와 일치한다. |
| 7 | W-07 | 병합됨 | 비식별 분석 이벤트 기반 | `feat/analytics-foundation` | `feat(analytics): 공개 블로그 행동 지표 기반을 추가한다` | 조회·검색·주제·출처 이벤트 계약이 개인정보 없이 동작한다. |
| 8 | W-08 | 병합됨 | `develop` PR 품질 게이트 | `ci/public-quality-gate` | `ci(blog): 공개 배포 품질 게이트를 추가한다` | 커밋·공백·테스트·빌드·공개 경계 검사가 필수로 실행된다. |
| 9 | W-09 | 병합됨 | 공개 글 읽기 화면 단순화 | `fix/simplify-reading-ui` | `fix(blog): 공개 글 읽기 화면을 단순화한다` | 형식·읽는 시간·작성 기준을 노출하지 않고 주제·검색 중심으로 읽힌다. |
| 10 | W-10 | 병합됨 | 공개 콘텐츠 데이터 계약 단순화 | `refactor/content-public-contract` | `refactor(content): 공개 글 데이터 계약을 단순화한다` | `format`, `readingTimeMinutes`, `basis`와 형식 필터 계약을 제거하고 테스트를 갱신한다. |
| 11 | W-11 | 대기 | 검색 상태와 목록 확장 방식 확정 | `feat/archive-navigation` | `feat(blog): 글 탐색 상태와 목록 확장을 구성한다` | 검색·주제 상태가 이동 후 유지되고 글 증가 시 목록을 나눠 볼 수 있다. |

## 2. 로컬 전용 관리자

| 순서 | ID | 상태 | 작업 | 권장 브랜치 | PR 제목 | 완료 조건 |
| --- | --- | --- | --- | --- | --- | --- |
| 12 | A-01 | 대기 | 웹·관리자·공용 콘텐츠 구조 분리 | `refactor/admin-workspace` | `refactor(repo): 공개 웹과 로컬 관리자를 분리한다` | `apps/web`, `apps/admin`, `packages/content`, `packages/ui`가 역할별로 나뉘고 공개 번들에 관리자가 없다. |
| 13 | A-02 | 대기 | 로컬 관리자 접근 경계 | `feat/admin-local-access` | `feat(admin): 로컬 관리자 접근 경계를 구성한다` | 관리자는 로컬에서만 실행되고 공개 경로·번들·환경 변수에서 제외된다. |
| 14 | A-03 | 대기 | 글 작성·편집·미리보기 | `feat/admin-post-editor` | `feat(admin): 글 작성과 편집 화면을 추가한다` | 제목, slug, 요약, 본문, 분야, 태그, 출처, 날짜, SEO 정보를 입력하고 미리 볼 수 있다. |
| 15 | A-04 | 대기 | 발행 전 SEO·GEO 검사 | `feat/admin-content-check` | `feat(admin): 발행 전 콘텐츠 검사를 추가한다` | 필수 정보, 출처, 기준 시점, slug 중복, 공개 메타데이터를 발행 전에 확인한다. |

## 3. Supabase 백엔드

| 순서 | ID | 상태 | 작업 | 권장 브랜치 | PR 제목 | 완료 조건 |
| --- | --- | --- | --- | --- | --- | --- |
| 16 | B-01 | 대기 | 콘텐츠·출처·분석 스키마와 RLS | `feat/db-content-schema` | `feat(db): 공개 콘텐츠 스키마와 RLS를 추가한다` | 발행 글 공개 읽기와 로컬 관리자 쓰기 정책이 마이그레이션으로 재현된다. |
| 17 | B-02 | 대기 | 공개 웹 읽기 저장소 | `feat/web-content-repository` | `feat(content): 공개 글 저장소를 Supabase에 연결한다` | 공개 앱은 발행 글만 읽고 fixture 없이 목록·상세·SEO 표면을 제공한다. |
| 18 | B-03 | 대기 | 로컬 관리자 쓰기 저장소 | `feat/admin-content-repository` | `feat(admin): 로컬 관리자 콘텐츠 저장소를 연결한다` | 로컬의 service role로 임시 저장·발행·수정을 수행하고 공개 번들에는 키가 없다. |
| 19 | B-04 | 대기 | 비식별 지표 저장·집계 | `feat/analytics-persistence` | `feat(analytics): 블로그 지표 저장과 조회를 연결한다` | 정의된 이벤트만 저장하고 기간·글·유입 기준 지표를 관리자에서 확인한다. |

## 4. 통합 검증과 공개 배포

| 순서 | ID | 상태 | 작업 | 권장 브랜치 | PR 제목 | 완료 조건 |
| --- | --- | --- | --- | --- | --- | --- |
| 20 | Q-01 | 대기 | 운영 전 통합 검증 | `chore/production-readiness` | `chore(repo): 공개 운영 전환을 검증한다` | 공개·관리자 경계, RLS, 실데이터, 분석, 브라우저, 접근성, SEO/GEO, 보안, 백업·되돌리기를 검증한다. |
| 21 | D-01 | 대기 | `develop → main` 병합과 Vercel 공개 배포 | `ci/vercel-public-deploy` | `ci(blog): 공개 블로그 배포를 연결한다` | 전체 검증이 통과한 공개 블로그만 Vercel에 배포하고 운영 주소를 재검증한다. |

## 지금 할 일

다음 작업은 `W-11`이다. 검색어와 선택한 주제가 화면 이동 뒤에도 유지되게 하고, 글이 늘어날 때 목록을 나눠 볼 방식을 확정한다.
