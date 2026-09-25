#!/usr/bin/env bash
# ==============================================================================
# Scamfy Canonical Verification Runner (POSIX Shell)
# Runs full 5-gate local CI verification pipeline
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${WORKSPACE_ROOT}/scamfy"

echo "========================================"
echo " 🛡️ Scamfy Local CI Verification Suite"
echo "========================================"

# --- Gate 1: Frontend Strict Typecheck ---
echo -e "\n[1/5] Checking Frontend TypeScript Types..."
npm run typecheck
echo "✅ Frontend Typecheck Passed"

# --- Gate 2: Frontend ESLint ---
echo -e "\n[2/5] Running Frontend ESLint..."
npm run lint
echo "✅ Frontend ESLint Passed"

# --- Gate 3: Frontend Vitest Unit Tests ---
echo -e "\n[3/5] Running Frontend Unit & Component Tests..."
npm run test:run
echo "✅ Frontend Tests Passed"

# Select available Python executable
if command -v python3 &>/dev/null; then
    PYTHON_BIN="python3"
elif command -v python &>/dev/null; then
    PYTHON_BIN="python"
else
    echo "❌ Error: Neither python3 nor python executable found in PATH" >&2
    exit 1
fi

# --- Gate 4: Backend Ruff Lint & Format Check ---
echo -e "\n[4/5] Checking Backend Ruff Lint & Formatting..."
"$PYTHON_BIN" -m ruff check backend/
"$PYTHON_BIN" -m ruff format --check backend/
echo "✅ Backend Ruff Lint & Format Passed"

# --- Gate 5: Backend Pytest Suite ---
echo -e "\n[5/5] Running Backend Pytest Suite..."
"$PYTHON_BIN" -m pytest backend/tests
echo "✅ Backend Pytest Passed"

echo "========================================"
echo " 🎉 ALL 5 VERIFICATION GATES PASSED!"
echo "========================================"
