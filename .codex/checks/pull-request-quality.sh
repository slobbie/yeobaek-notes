#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://yeobaek-notes.example}"

fail() {
  printf 'public quality check failed: %s\n' "$1" >&2
  exit 1
}

if [ -d app/admin ] || [ -d app/api/admin ]; then
  fail "관리자 경로가 공개 Next.js 앱에 포함되어 있습니다."
fi

tracked_environment_files="$(git ls-files | awk '/(^|\/)\.env($|\.)/ && $0 !~ /(^|\/)\.env\.example$/ { print }')"
if [ -n "$tracked_environment_files" ]; then
  printf '%s\n' "$tracked_environment_files" >&2
  fail "예시 파일이 아닌 환경 변수 파일이 Git에 추적되고 있습니다."
fi

public_source_paths=(app next.config.mjs package.json)
if [ -d public ]; then
  public_source_paths+=(public)
fi

if git grep -nEi 'SUPABASE_(SERVICE_ROLE|SECRET_KEY)|service_role' -- "${public_source_paths[@]}"; then
  fail "공개 소스에서 관리자용 비밀 키 식별자가 발견되었습니다."
fi

npm test
npm run build

[ -f .next/server/app-paths-manifest.json ] || fail "공개 라우트 매니페스트가 생성되지 않았습니다."

if grep -Eq '"/(api/)?admin(/|")' .next/server/app-paths-manifest.json; then
  fail "프로덕션 라우트에 관리자 경로가 포함되어 있습니다."
fi

if grep -RIlE 'SUPABASE_(SERVICE_ROLE|SECRET_KEY)|service_role' .next/server .next/static >/dev/null; then
  fail "프로덕션 결과물에서 관리자용 비밀 키 식별자가 발견되었습니다."
fi

printf 'public quality check passed\n'
