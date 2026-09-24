# Phase 2: Project Structure, GSD Setup & Coding Standards — Context

## Goal
Establish the clean modular monolith workspace structure, Next.js frontend scaffolding with strict TypeScript, FastAPI backend scaffolding with Ruff/Pytest, environment variable policy, repository verification hooks, and the canonical Definition of Done standards.

## Scope & Deliverables
1. **Next.js Frontend Scaffolding & Strict TypeScript**:
   - Establish App Router directories (`app/(public)/`, `app/(auth)/`, `app/cases/`, `app/intel/`, `app/report/`, `components/ui/`, `components/shared/`, `lib/api/`, `lib/schemas/`, `lib/utils/`).
   - Configure strict TypeScript (`strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`).
   - Configure ESLint, Prettier, and Vitest test runners with npm scripts.
2. **FastAPI Backend Scaffolding & Python Tooling**:
   - Scaffold backend structure (`backend/app/api/v1/`, `backend/app/core/`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/services/`, `backend/tests/`).
   - Setup `backend/requirements.txt` and `backend/pyproject.toml` (Ruff & Pytest).
   - Create FastAPI application factory (`backend/app/main.py`) with sanitized global exception handling (`SEC-03`) and health check test.
3. **Environment Isolation & Secrets Policy**:
   - Create `.env.example` templates for both frontend and backend.
   - Formalize secret boundaries ensuring zero private credentials enter client bundles (`SEC-02`).
4. **Repository Verification Hooks & Engineering Standards**:
   - Set up automated local CI verification script (`scripts/verify.ps1` / `scripts/verify.sh`).
   - Author `docs/coding-standards.md` documenting final repository layout, architecture layers, commit standards, and Phase Definition of Done (`ENG-04`, `ENG-05`).
5. **Scope Fences**:
   - PostgreSQL schema models, database relationships, and Alembic migrations belong strictly to Phase 3 and are excluded from Phase 2.

## Linked Requirements
- `ENG-04`: Documented verification trail and quality gates for every phase.
- `ENG-05`: Architectural decisions and standards recorded in `.planning/`.
- `SEC-02`: Server-side isolation of secrets and credentials.
- `SEC-03`: Sanitized error handling and provider exception masking.
