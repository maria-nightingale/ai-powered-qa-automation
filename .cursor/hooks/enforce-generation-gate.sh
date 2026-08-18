#!/usr/bin/env bash
# Generation gate for Playwright specs under tests/**.
# BLOCK (exit 2) when a spec has no expect( assertions or uses CSS/XPath page.locator.
set -euo pipefail

input="$(cat)"

file_path="$(python3 - <<'PY' "$input"
import json, sys
payload = json.loads(sys.argv[1])
print(payload.get("file_path") or payload.get("filePath") or "")
PY
)"

if [[ -z "$file_path" ]]; then
  echo "Generation gate: missing file_path in hook payload" >&2
  exit 1
fi

# Only enforce on files under tests/**
case "$file_path" in
  */tests/* | tests/*) ;;
  *)
    exit 0
    ;;
esac

if [[ ! -f "$file_path" ]]; then
  echo "Generation gate: edited file not found on disk: $file_path" >&2
  exit 1
fi

content="$(<"$file_path")"

if ! grep -q 'expect(' <<< "$content"; then
  echo "Generation gate BLOCKED: $file_path has no expect( assertions." >&2
  exit 2
fi

if grep -E -q "page\\.locator\\s*\\(\\s*['\"\`][^'\"\`]*[.#]|page\\.locator\\s*\\(\\s*['\"\`][^'\"\`]*//" <<< "$content"; then
  echo "Generation gate BLOCKED: $file_path uses CSS or XPath page.locator (forbidden)." >&2
  exit 2
fi

echo "Generation gate ALLOWED: $file_path passed validation." >&2
exit 0
