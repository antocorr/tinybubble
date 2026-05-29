#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"

echo "[bubble-components-pubsub-plugins] audit root: ${ROOT}"

echo
echo "[1/7] Searching for deprecated props signal access..."
grep -R -n -E "this\.props\.[a-zA-Z0-9_]+\.value" --include='*.js' "${ROOT}" || true

echo
echo "[2/7] Searching for template props. usage..."
grep -R -n -E "\{\{[[:space:]]*props\." --include='*.js' "${ROOT}" || true

echo
echo "[3/7] Searching for mustache in common HTML attributes..."
grep -R -n -E '(src|href|disabled|class|alt|title)="\{\{' --include='*.js' "${ROOT}" || true

echo
echo "[4/7] Searching for legacy bubble.topic API..."
grep -R -n -E "\bbubble\.topic\(" --include='*.js' "${ROOT}" || true

echo
echo "[5/7] Searching for direct topic.on chains without handler refs..."
grep -R -n -E "\.events\.topic\(\"[a-zA-Z0-9_-]+\"\)\.on\(" --include='*.js' "${ROOT}" || true

echo
echo "[6/7] Searching for bubble-translate non-wrapper imports in Bubble components..."
grep -R -n -E "bubble-translate/index\.js" --include='*.bubble.js' --include='*.bub.js' "${ROOT}" || true

echo
echo "[7/7] Searching for multiple globals.t assignments..."
grep -R -n -E "globals\.t[[:space:]]*=" --include='*.js' "${ROOT}" || true

echo
echo "[bubble-components-pubsub-plugins] audit completed"
