# Phase 2: Project Structure, GSD Setup & Coding Standards — Plan

- **Phase**: 02
- **Milestone**: 0 (Foundation)
- **Goal**: Establish the co-located modular monolith workspace structure, Next.js frontend scaffolding with strict TypeScript, FastAPI backend scaffolding with Ruff and Pytest, environment isolation policies, pre-commit enforcement hooks, canonical local verification entry points (`scripts/verify.ps1` / `scripts/verify.sh`), and the Definition of Done.
- **Requirements Covered**: `ENG-04`, `ENG-05`, `SEC-02`, `SEC-03`
- **Scope Fences**: No Scamfy product domain logic, database tables, PostgreSQL schemas, or Alembic migrations are implemented in this phase. (Database schema & migrations belong strictly to Phase 3).

---

## Detailed Task Breakdown

### Task 1: Next.js Frontend Scaffolding & Strict TypeScript Tooling
- **Action**:
  - Scaffold App Router directory tree: `app/(public)/`, `app/(auth)/`, `app/cases/`, `app/intel/`, `app/report/`, `components/ui/`, `components/shared/`, `lib/api/`, `lib/schemas/`, `lib/utils/`.
  - Configure `tsconfig.json` with strict compiler flags (`strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`, `@/*` path aliases).
  - Configure frontend linting & formatting (`eslint.config.mjs`, `.prettierrc`, and `package.json` scripts: `typecheck`, `lint`, `format:check`).
  - Configure Vitest component test harness (`vitest.config.ts`, `lib/test-sanity.test.ts`).
- **Verification**: Run `npm run typecheck`, `npm run lint`, and `npm run test:run`.

### Task 2: FastAPI Backend Scaffolding & Python Tooling
- **Action**:
  - Scaffold backend directory structure: `backend/app/api/v1/`, `backend/app/core/`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/services/`, `backend/tests/`.
  - Create `backend/requirements.txt` (FastAPI, Uvicorn, Pydantic v2, SQLAlchemy, SlowAPI, Pytest, pytest-asyncio, HTTPX, puremagic).
  - Create `backend/pyproject.toml` (Ruff linter/formatter config + Pytest async test configuration).
  - Create `backend/app/main.py` (FastAPI app factory, CORS middleware, global exception handlers masking internal traces `SEC-03`, `/api/v1/health` endpoint).
  - Create `backend/app/core/config.py` (Pydantic `BaseSettings` for validated environment variables with fail-fast startup).
  - Create `backend/tests/test_health.py` (Health check and sanitized error response tests).
- **Verification**: Run `pytest backend/tests`, `ruff check backend/`, and `ruff format --check backend/`.

### Task 3: Environment Variable Templates & Secrets Isolation Policy
- **Action**:
  - Create frontend `.env.example` defining `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_URL`.
  - Create backend `backend/.env.example` defining `NVIDIA_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `CORS_ORIGINS`.
  - Document strict secret boundary ensuring private credentials never enter frontend bundles (`SEC-02`).
- **Verification**: Verify git status ensures no real `.env` secrets are tracked.

### Task 4: Pre-Commit Enforcement & Canonical Local Verification Scripts
- **Action**:
  - Create the canonical local verification entry points:
    - `scripts/verify.ps1` (PowerShell for Windows)
    - `scripts/verify.sh` (POSIX Shell for Linux / CI)
    - Both scripts execute the full five-gate verification suite:
      1. Frontend TypeScript Typecheck (`npm run typecheck`)
      2. Frontend ESLint (`npm run lint`)
      3. Frontend Unit / Component Tests (`npm run test:run`)
      4. Backend Ruff Lint & Format Check (`ruff check backend/` & `ruff format --check backend/`)
      5. Backend Pytest Suite (`pytest backend/tests`)
  - Set up pre-commit enforcement mechanism matching `AGENTS.md`:
    - Configure git pre-commit hook script in `.githooks/pre-commit` (or `husky`) that invokes the verification script before commits are allowed, preventing broken builds or untyped code from entering git history.
  - Author [**`docs/coding-standards.md`**](../../../docs/coding-standards.md) documenting:
    - Canonical final repository layout and module boundaries.
    - Architecture layering & trust boundaries (FastAPI trust boundary vs. client UI).
    - Provider error masking & sanitization rules (`SEC-03`).
    - Conventional git commit standards (`feat`, `fix`, `docs`, `refactor`, `test`, `plan`).
    - Phase Definition of Done checklist (`ENG-04`, `ENG-05`).
- **Verification**: Execute `scripts/verify.ps1` and verify all checks pass end-to-end.

---

## Canonical Verification Gates (Definition of Done)

| Gate | Verification Command | Passing Criteria |
| :--- | :--- | :--- |
| **Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors under strict mode. |
| **Frontend Linting** | `npm run lint` | Zero ESLint warnings or errors. |
| **Frontend Unit Tests** | `npm run test:run` | All Vitest component/utility tests pass. |
| **Frontend Production Build** | `npm run build` | Next.js production build succeeds cleanly. |
| **Backend Linting** | `ruff check backend/` | Zero Python lint issues. |
| **Backend Formatting** | `ruff format --check backend/` | All Python files comply with Ruff format rules. |
| **Backend Unit Tests** | `pytest backend/tests` | All health and exception sanitization tests pass. |
| **Pre-commit Integrity** | `scripts/verify.ps1` / `.githooks/pre-commit` | Hook blocks non-compliant commits; script runs clean. |
| **Secrets Inspection** | Git tracking audit | No `.env` files, API keys, or credentials tracked (`SEC-02`). |
| **Planning Trail** | `VERIFICATION.md` & `SUMMARY.md` | Audit trail documented in `.planning/`. |
