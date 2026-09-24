# ==============================================================================
# Scamfy Canonical Verification Runner (PowerShell)
# Runs full 5-gate local CI verification pipeline before commits / phase completion
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🛡️ Scamfy Local CI Verification Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$WorkspaceRoot = Resolve-Path "$PSScriptRoot\.."
Set-Location "$WorkspaceRoot\scamfy"

# --- Gate 1: Frontend Strict Typecheck ---
Write-Host "`n[1/5] Checking Frontend TypeScript Types..." -ForegroundColor Yellow
npm run typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript Typecheck FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend Typecheck Passed" -ForegroundColor Green

# --- Gate 2: Frontend ESLint ---
Write-Host "`n[2/5] Running Frontend ESLint..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ESLint FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend ESLint Passed" -ForegroundColor Green

# --- Gate 3: Frontend Vitest Unit Tests ---
Write-Host "`n[3/5] Running Frontend Unit & Component Tests..." -ForegroundColor Yellow
npm run test:run
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend Vitest Tests FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend Tests Passed" -ForegroundColor Green

# --- Gate 4: Backend Ruff Lint & Format Check ---
Write-Host "`n[4/5] Checking Backend Ruff Lint & Formatting..." -ForegroundColor Yellow
python -m ruff check backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ruff Lint FAILED" -ForegroundColor Red
    exit 1
}

python -m ruff format --check backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ruff Format Check FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend Ruff Lint & Format Passed" -ForegroundColor Green

# --- Gate 5: Backend Pytest Suite ---
Write-Host "`n[5/5] Running Backend Pytest Suite..." -ForegroundColor Yellow
python -m pytest backend/tests
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend Pytest FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend Pytest Passed" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " 🎉 ALL 5 VERIFICATION GATES PASSED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
