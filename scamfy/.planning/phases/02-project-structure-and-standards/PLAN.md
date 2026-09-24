# Phase 2: Project Structure, GSD Setup & Coding Standards — Plan

- **Phase**: 02
- **Milestone**: 0 (Foundation)
- **Goal**: Establish the co-located modular monolith architecture, Next.js frontend scaffolding with strict TypeScript, FastAPI backend scaffolding with Ruff/Pytest, environment isolation policies, repository verification hooks, and the canonical Definition of Done.
- **Requirements Covered**: `ENG-04`, `ENG-05`, `SEC-02`, `SEC-03`
- **Scope Boundary**: PostgreSQL models, ORM relationships, and Alembic migrations belong strictly to Phase 3.

---

## Detailed Task Breakdown

### Task 1: Next.js Frontend Scaffolding & Strict TypeScript Tooling
- **Action**:
  - Scaffold App Router directory structure: `app/(public)/`, `app/(auth)/`, `app/cases/`, `app/intel/`, `app/report/`, `components/ui/`, `components/shared/`, `lib/api/`, `lib/schemas/`, `lib/utils/`.
  - Configure `tsconfig.json` with strict compiler flags (`strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`, `paths` alias mapping `@/*`).
  - Configure frontend linting & formatting (`eslint.config.mjs`, `.prettierrc`, and `package.json` scripts: `typecheck`, `lint`, `format:check`).
  - Configure Vitest component test harness (`vitest.config.ts`, `lib/test-sanity.test.ts`).
- **Verification**: Run `npm run typecheck`, `npm run lint`, and `npm run test`.

### Task 2: FastAPI Backend Scaffolding & Python Tooling
- **Action**:
  - Scaffold backend directory structure: `backend/app/api/v1/`, `backend/app/core/`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/services/`, `backend/tests/`.
  - Create `backend/requirements.txt` (FastAPI, Uvicorn, Pydantic v2, SQLAlchemy, SlowAPI, Pytest, pytest-asyncio, HTTPX, puremagic).
  - Create `backend/pyproject.toml` (Ruff linter/formatter config + Pytest async test configuration).
  - Create `backend/app/main.py` (FastAPI app factory, CORS middleware, global exception handlers masking internal traces `SEC-03`, `/api/v1/health` endpoint).
  - Create `backend/app/core/config.py` (Pydantic `BaseSettings` for validated environment variables).
  - Create `backend/tests/test_health.py` (Health check and sanitized error response tests).
- **Verification**: Run `pytest backend/tests` and verify clean execution.

### Task 3: Environment Variable Templates & Secrets Isolation Policy
- **Action**:
  - Create frontend `.env.example` defining `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_URL`.
  - Create backend `backend/.env.example` defining `NVIDIA_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `CORS_ORIGINS`.
  - Document strict secret boundary ensuring private credentials never enter frontend bundles (`SEC-02`).
- **Verification**: Verify git status ensures no real `.env` secrets are tracked.

### Task 4: Repository Verification Hooks & Coding Standards Documentation
- **Action**:
  - Create automated repository verification script (`scripts/verify.ps1` / `scripts/verify.sh`) running full CI verification pipeline:
    1. Frontend: TypeScript typecheck (`tsc --noEmit`)
    2. Frontend: ESLint (`npm run lint`)
    3. Frontend: Vitest suite (`npm run test:run`)
    4. Backend: Ruff lint & format check
    5. Backend: Pytest suite
  - Author [**`docs/coding-standards.md`**](../../../docs/coding-standards.md) detailing:
    - Final documented repository structure.
    - Architecture layering & trust boundaries (FastAPI trust boundary vs. client UI).
    - Provider error masking & sanitization rules (`SEC-03`).
    - Conventional git commit standards (`feat`, `fix`, `docs`, `refactor`, `test`, `plan`).
    - Phase Definition of Done checklist (`ENG-04`, `ENG-05`).
- **Verification**: Ensure all commands in `verify.ps1` execute successfully.

---

## Phase Verification Gates (Definition of Done)

| Gate | Verification Command | Criteria |
| :--- | :--- | :--- |
| **Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors in strict mode. |
| **Frontend Linting** | `npm run lint` | Zero ESLint warnings/errors. |
| **Frontend Unit Tests** | `npm run test:run` | All Vitest test suites pass. |
| **Frontend Build** | `npm run build` | Next.js production bundle compiles cleanly. |
| **Backend Lint & Format** | `ruff check backend/` | Zero lint issues in Python code. |
| **Backend Unit Tests** | `pytest backend/tests` | All health and error sanitization tests pass. |
| **Security Review** | Secrets Inspection | No API keys or `.env` files tracked in git (`SEC-02`). |
| **Planning Artifacts** | `VERIFICATION.md` & `SUMMARY.md` | Verification trail documented in `.planning/`. |
