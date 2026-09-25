# Phase 2: Project Structure, GSD Setup & Coding Standards — Context

- **Phase**: 02 - Project Structure, GSD Setup & Coding Standards
- **Milestone**: 0 (Foundation)
- **Status**: Complete ✅

## Goal
Establish the clean modular monolith workspace structure, Next.js frontend scaffolding with strict TypeScript, FastAPI backend scaffolding with Ruff and Pytest, environment variable policy, pre-commit enforcement hooks, canonical local verification entry points (`scripts/verify.ps1` / `scripts/verify.sh`), and the canonical Definition of Done standards.

## Scope & Deliverables
1. **Next.js Frontend Scaffolding & Strict TypeScript**:
   - Establish App Router directories and foundational primitives (`app/cases/page.tsx`, `app/intel/page.tsx`, `app/report/page.tsx`, `components/ui/button.tsx`, `components/shared/risk-badge.tsx`, `lib/api/client.ts`, `lib/schemas/index.ts`, `lib/utils.ts`).
   - Configure strict TypeScript (`strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`).
   - Configure ESLint flat config (`eslint.config.mjs`) and Vitest test harness (`vitest.config.ts`, `lib/test-sanity.test.ts`).
   - Provide npm scripts: `typecheck` (`tsc --noEmit`), `lint` (`eslint .`), `test` (`vitest` watch mode), and `test:run` (`vitest run` CI mode).
2. **FastAPI Backend Scaffolding & Python Tooling**:
   - Scaffold backend structure (`backend/app/api/v1/`, `backend/app/core/`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/services/`, `backend/tests/`).
   - Set up `backend/requirements.txt` with `fastapi`, `uvicorn[standard]`, `pydantic`, `pydantic-settings`, `sqlalchemy`, `slowapi`, `httpx`, `puremagic`, `pytest`, `pytest-asyncio`, and `ruff`.
   - Set up `backend/pyproject.toml` (Ruff linter/formatter & Pytest asyncio configuration).
   - Create FastAPI application factory (`backend/app/main.py`) with sanitized global exception handling (`SEC-03`), validated settings (`backend/app/core/config.py`), and health check endpoint test (`backend/tests/test_health.py`).
3. **Environment Isolation & Secrets Policy**:
   - Create `.env.example` templates for both frontend (`scamfy/.env.example`) and backend (`scamfy/backend/.env.example`).
   - Formalize secret boundaries ensuring zero private credentials enter client bundles (`SEC-02`).
4. **Pre-Commit Enforcement & Canonical Local Verification Scripts**:
   - Create canonical local verification entry points: `scripts/verify.ps1` (Windows PowerShell) and `scripts/verify.sh` (POSIX Bash).
   - Document platform-specific invocation expectations (`powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` on Windows, `bash scripts/verify.sh` on POSIX).
   - Set up git pre-commit hook enforcement (`.githooks/pre-commit`) calling local verification before commits are accepted.
   - Author [**`docs/coding-standards.md`**](../../../docs/coding-standards.md) documenting final repository layout, architecture layers, commit standards, and Phase Definition of Done (`ENG-04`, `ENG-05`).
5. **Phase Audit & Planning Records**:
   - Document full execution and verification records in `VERIFICATION.md` and `SUMMARY.md`.
6. **Strict Scope Fences**:
   - No Scamfy product domain logic, PostgreSQL schema tables, database models, or Alembic migrations are implemented in Phase 2 (strictly reserved for Phase 3).

## Linked Requirements
- `ENG-04`: Documented verification trail and quality gates for every phase.
- `ENG-05`: Architectural decisions and standards recorded in `.planning/`.
- `SEC-02`: Server-side isolation of secrets and credentials.
- `SEC-03`: Sanitized error handling and provider exception masking.
