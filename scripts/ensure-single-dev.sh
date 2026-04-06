#!/usr/bin/env bash
set -euo pipefail

# Keep one active Nuxt dev server process.
# Stop stale listeners on common Nuxt dev ports before startup.
if command -v lsof >/dev/null 2>&1; then
  pids="$(lsof -tiTCP:3000 -sTCP:LISTEN || true)"
  pids_3001="$(lsof -tiTCP:3001 -sTCP:LISTEN || true)"
  pids="${pids} ${pids_3001}"
  pids="$(echo "${pids}" | tr ' ' '\n' | awk 'NF' | sort -u | tr '\n' ' ')"
  if [ -n "${pids}" ]; then
    echo "Stopping stale dev process(es): ${pids}"
    kill ${pids} || true
    sleep 0.3
  fi
fi
