#!/usr/bin/env bash

role_hint() {
  case "$1" in
    AGENTS.md|.codex/*|.github/*|docs/*-conventions.md) printf '%s' harness-architect ;;
    src/lib/*) printf '%s' data-layer-dev ;;
    apps/*/src/lib/*|packages/content/*) printf '%s' data-layer-dev ;;
    src/styles.css|src/components/ui/*) printf '%s' design-system-dev ;;
    apps/*/src/styles.css|apps/*/src/components/ui/*|packages/ui/*) printf '%s' design-system-dev ;;
    package.json|package-lock.json|vite.config.mjs|index.html|worker/*|scripts/*|tests/*) printf '%s' frontend-architect ;;
    src/*) printf '%s' frontend-dev ;;
    apps/web/*|apps/admin/*) printf '%s' frontend-dev ;;
    apps/*|packages/*) printf '%s' frontend-architect ;;
    *) printf '%s' unassigned ;;
  esac
}

role_allows() {
  local actor="$1" path="$2" owner
  owner="$(role_hint "$path")"
  [ "$owner" = "$actor" ] || { [ "$owner" = unassigned ] && [ "$actor" = frontend-architect ]; }
}
