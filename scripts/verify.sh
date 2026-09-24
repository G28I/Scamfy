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

# --- Gate 4: Backend Ruff Lint & Format Check ---
echo -e "\n[4/5] Checking Backend Ruff Lint & Formatting..."
python -m ruff check backend/
python -m ruff format --check backend/
echo "✅ Backend Ruff Lint & Format Passed"

# --- Gate 5: Backend Pytest Suite ---
echo -e "\n[5/5] Running Backend Pytest Suite..."
python -m pytest backend/tests
echo "✅ Backend Pytest Passed"

echo "========================================"
echo " 🎉 ALL 5 VERIFICATION GATES PASSED!"
echo "========================================"
