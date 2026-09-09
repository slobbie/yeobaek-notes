#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ACTOR=""
PATH_INPUT=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --actor) ACTOR="${2:-}"; shift 2 ;;
    --path) PATH_INPUT="${2:-}"; shift 2 ;;
    *) printf 'usage: scope-check.sh --actor ROLE --path PATH\n' >&2; exit 2 ;;
  esac
done

[ -n "$ACTOR" ] && [ -n "$PATH_INPUT" ] || { printf 'role and path are required\n' >&2; exit 2; }
REL="${PATH_INPUT#"$ROOT"/}"
case "$REL" in /*) printf 'path must be inside the repository\n' >&2; exit 2 ;; esac

# shellcheck source=/dev/null
. "$ROOT/.codex/role-config.sh"
if role_allows "$ACTOR" "$REL"; then
  printf 'allowed: %s may modify %s\n' "$ACTOR" "$REL"
else
  printf 'blocked: %s is owned by %s\n' "$REL" "$(role_hint "$REL")" >&2
  exit 2
fi
