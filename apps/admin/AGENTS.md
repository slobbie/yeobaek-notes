# 로컬 관리자 경계

- 이 앱은 로컬에서만 실행하며 배포용 `build`와 `start` 명령을 두지 않는다.
- 공개 앱 경로에 관리자 화면이나 쓰기 기능을 추가하지 않는다.
- Supabase 관리자 키는 이후 로컬 관리자 환경 변수에만 둔다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
