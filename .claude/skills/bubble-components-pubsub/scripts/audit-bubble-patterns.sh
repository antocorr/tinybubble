#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"

echo "[bubble-skill] audit root: ${ROOT}"

echo
echo "[1/4] Searching for deprecated props signal access..."
rg "this\.props\.[a-zA-Z0-9_]+\.value" "${ROOT}" || true

echo
echo "[2/4] Searching for template props. usage..."
rg "\{\{\s*props\." "${ROOT}" || true

echo
echo "[3/4] Searching for legacy bubble.topic API..."
rg "\bbubble\.topic\(" "${ROOT}" || true

echo
echo "[4/4] Searching for topic .on calls without stored handler hint..."
rg "\.topic\(\"[a-zA-Z0-9_-]+\"\)\.on\(" "${ROOT}" || true

echo
echo "[bubble-skill] audit completed"
