#!/usr/bin/env bash

role_hint() {
  case "$1" in
    AGENTS.md|*/AGENTS.md|*/CLAUDE.md|.codex/*|.github/*|docs/*-conventions.md|docs/implementation-plan.md) printf '%s' harness-architect ;;
    package.json|package-lock.json|apps/*/package.json|packages/*/package.json|apps/*/next.config.mjs|tests/*|apps/*/tests/*) printf '%s' frontend-architect ;;
    apps/*/app/lib/*|packages/content/*) printf '%s' data-layer-dev ;;
    apps/*/app/globals.css|apps/*/app/components/ui/*|packages/ui/*) printf '%s' design-system-dev ;;
    apps/*/app/*) printf '%s' frontend-dev ;;
    apps/*|packages/*) printf '%s' frontend-architect ;;
    *) printf '%s' unassigned ;;
  esac
}

role_allows() {
  local actor="$1" path="$2" owner
  owner="$(role_hint "$path")"
  [ "$owner" = "$actor" ] || { [ "$owner" = unassigned ] && [ "$actor" = frontend-architect ]; }
}
