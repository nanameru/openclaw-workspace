#!/usr/bin/env bash
set -euo pipefail

if ! command -v xcodegen >/dev/null 2>&1; then
  echo "xcodegen not found. Install with: brew install xcodegen"
  exit 1
fi

cd "$(dirname "$0")/.."
xcodegen generate

echo "✅ Generated PhotoToLifeJP.xcodeproj"
echo "Open it with: open PhotoToLifeJP.xcodeproj"
