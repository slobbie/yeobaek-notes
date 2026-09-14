# 데이터베이스 설계

## 범위

이 문서는 Supabase에 저장하는 콘텐츠·출처·분석 데이터의 구조와 접근 경계를 기록한다. 공개 웹은 RLS로 허용된 발행 콘텐츠만 읽고, 로컬 관리자 서버만 `service_role`로 쓰기 작업을 수행한다.

## 관계

```text
posts 1 ──── 0..n post_sources

analytics_events (콘텐츠와 분리된 비식별 행동 이벤트)
```

## 테이블

### `posts`

| 컬럼 | 설명 |
| --- | --- |
| `id` | 내부 UUID 식별자 |
| `slug` | 발행 뒤 유지하는 고유 공개 주소 |
| `status` | `draft` 또는 `published` |
| `title`, `excerpt`, `body_markdown` | 공개 글 본문 정보 |
| `category`, `tags` | 탐색용 분류 정보 |
| `seo_title`, `seo_description` | 공개 메타데이터 |
| `published_at` | 최초 발행 시점. 초안에서는 `NULL` |
| `created_at`, `updated_at` | DB가 관리하는 생성·수정 시점 |

`slug` 형식, 상태, 분야, 비어 있지 않은 공개 필수 값과 발행 상태별 날짜 존재 여부를 데이터베이스가 검사한다. 발행 글은 초안으로 되돌릴 수 없다.

### `post_sources`

글의 출처를 순서대로 저장한다. `post_id`와 `position`은 유일하며 글 삭제 시 함께 삭제된다. 제목·발행처·HTTP(S) URL·확인 날짜가 필수다. 미래 확인 날짜는 트리거가 거부한다.

### `analytics_events`

현재 분석 계약의 이벤트 이름, 발생 시각, 쿼리·해시가 제거된 공개 경로, 허용 속성 객체를 저장할 최소 구조다. 이벤트는 콘텐츠 테이블과 연결하지 않으며 개인·세션·기기 식별자는 저장하지 않는다. 실제 수집 허용 목록 검증과 90일 원본 삭제, 24개월 집계 보존은 B-04에서 구현한다.

## 날짜 규칙

- 삽입 시 DB가 `created_at`, `updated_at`을 기록한다.
- 초안은 `published_at`이 없다.
- 최초 발행 시 DB가 `published_at`을 설정한다.
- 발행 글을 수정하면 `published_at`은 유지되고 `updated_at`만 갱신된다.

## RLS와 권한

`anon`, `authenticated` 역할은 `posts`와 `post_sources`의 `SELECT`만 가진다. RLS는 `published` 글 및 그 글에 연결된 출처만 반환한다. 초안, 콘텐츠 추가·수정·삭제, `analytics_events`의 모든 직접 접근은 허용하지 않는다.

`service_role`은 RLS를 우회하는 서버 전용 역할이다. 이 키는 `apps/admin/.env.local`에서만 사용하며, 브라우저·공개 앱·Vercel에는 저장하지 않는다.

## 마이그레이션과 검증

스키마는 `supabase/migrations/20260914000000_create_content_schema.sql`로 관리한다. 빈 로컬 DB에서 `supabase db reset`을 실행하고, 발행·초안·출처·공개 역할 접근을 확인한다. 운영 프로젝트 반영은 통합 검증 전 별도 사용자 확인이 필요하다.
