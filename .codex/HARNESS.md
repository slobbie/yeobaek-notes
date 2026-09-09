# 여백의 노트 작업 기준

## Architecture

- Public web is read-only for visitors and may access only published content through the public Supabase client.
- Local admin owns draft, publication, metadata, and analytics administration.
- `app/lib/**` is the current data boundary. It owns Supabase clients, content schemas, analytics contracts, and future repository functions.
- UI components receive data and callbacks. They do not initialize a database client or make network requests themselves.
- 구현 순서는 공개 블로그, 로컬 전용 관리자, Supabase 백엔드다. 단계 전환 PR은 이전 단계의 화면·콘텐츠 계약을 깨지 않는지 함께 검증한다.

## Content and analytics

- A post has a stable `slug`, one `category`, one `format`, zero or more `tags`, publication state, and SEO metadata.
- Event names use `lower_snake_case`. Required fields are `name`, `occurred_at`, and `page_path`.
- Do not send names, email addresses, raw IP addresses, authentication tokens, or free-text post bodies as analytics properties.
- When the database is introduced, document each event property before it is persisted.

## SEO와 GEO

- GEO는 별도 해킹 대상이 아니다. 검색 엔진과 AI가 인용·요약할 수 있도록 독자 우선의 원문, 명확한 맥락, 검증 가능한 출처, 일관된 메타데이터를 제공하는 작업이다.
- 모든 공개 글은 제목, 요약, 고정 URL, 발행일, 수정일, 분야, 형식, 태그와 함께 관리한다. 경제·시사·리뷰 글은 주장에 연결되는 출처와 기준 시점을 글 본문에서 확인할 수 있어야 한다.
- 브랜드 표기는 `여백의 노트`로 통일한다. 개인 신원을 공개하지 않아도 되지만, 소개 페이지와 편집 원칙에서 콘텐츠의 책임 주체·수정 원칙·문의 방법을 명확히 한다.
- 실제 화면에 보이는 정보와 일치할 때만 `Article` 또는 `BlogPosting` JSON-LD, canonical, Open Graph, 사이트맵, RSS를 제공한다. 공개 Next.js 앱 전환 시 서버 렌더링 또는 정적 생성을 기본값으로 한다.
- 제품 리뷰에는 검토 대상 모델, 사용·비교 기준, 확인 날짜와 출처를 남긴다. 경제 콘텐츠에는 자료의 기준 시점과 정보 제공 목적을 명확히 하며 개인 맞춤 투자 조언처럼 표현하지 않는다.
- AI 노출만을 위한 숨은 텍스트, 같은 내용의 대량 변형, 근거 없는 FAQ, 의미 없는 문단 분할, 근거 없는 `llms.txt` 생성은 금지한다.
- 지표는 검색 노출·클릭·색인 상태, 유입 검색어, 외부 인용·추천 유입을 분리해 본다. 개인 식별 정보는 수집하지 않으며, AI 기능 성과는 Search Console 등 확인 가능한 원본 지표가 생긴 뒤에만 보고한다.
- 상세 콘텐츠·구현·PR 기준은 `docs/seo-geo-conventions.md`를 따른다.

## Definition of done

- UI changes preserve keyboard navigation, visible focus, a programmatic input label, and Korean document language.
- A behavior change has a focused user-observable test once the test runner is installed.
- A public-content change preserves title, description, canonical URL, Open Graph data, sitemap/RSS, structured-data requirements, and visible source/date context when those surfaces exist.
- Run only relevant validation during implementation. Always report commands that were actually run and any validation gap.

## Git and hooks

- Husky runs a fast staged-file whitespace check. Commitlint enforces Conventional Commits.
- 커밋 형식은 `type(scope): subject`다. type과 scope는 영문 식별자, subject는 한국어 명령형으로 작성한다. 한 커밋에는 되돌릴 수 있는 하나의 목적만 담는다.
- 허용 type은 `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`, `build`다.
- 허용 scope는 `blog`, `admin`, `content`, `seo`, `analytics`, `ui`, `db`, `repo`다.
- build, integration, deployment 검증은 pre-commit 훅에 넣지 않는다. 실행했다면 PR의 검증 근거에 기록한다.
- 통합 기준 브랜치는 `develop`이다. 작업 브랜치는 항상 최신 `develop`에서 분기하고, PR의 base는 `develop`으로 둔다.
- 하나의 작업 브랜치에는 하나의 검증 가능한 목적만 둔다. 해당 목적의 커밋과 PR이 병합된 뒤 다음 작업 브랜치를 만든다.
- `main`은 배포 가능한 통합 결과만 받는다. 현재 공개 배포 전까지 `develop`에서 직접 `main`으로 병합하지 않는다.

## 풀 리퀘스트

- PR은 변경의 기준 문서다. `.github/pull_request_template.md`의 섹션을 삭제하지 않는다.
- PR 제목은 커밋과 같은 Conventional Commit 형식을 따른다.
- PR의 모든 주장은 확인 가능한 코드, 실행한 명령의 결과, 스크린샷·수동 관찰 또는 연결된 결정 기록 중 하나를 근거로 남긴다. 모르는 항목은 `확인 필요`로 표기하며, 실행하지 않은 검증을 통과한 것처럼 쓰지 않는다.
- 하나의 PR에는 하나의 제품 목적만 둔다. 관련 없는 후속 작업은 조용히 포함하지 말고 `포함하지 않은 범위`에 적는다.
- UI 변경에는 스크린샷 또는 짧은 수동 관찰 기록을 남긴다. 데이터, SEO/GEO, 분석, 보안, 접근성 변경은 영향 또는 `없음`을 명시한다.
