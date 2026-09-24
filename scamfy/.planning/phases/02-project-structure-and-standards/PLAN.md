# Phase 2: Project Structure, GSD Setup & Coding Standards — Plan

- **Phase**: 02
- **Milestone**: 0 (Foundation)
- **Status**: Complete ✅
- **Goal**: Establish the co-located modular monolith workspace structure, Next.js frontend scaffolding with strict TypeScript, FastAPI backend scaffolding with Ruff and Pytest, environment isolation policies, pre-commit enforcement hooks, canonical local verification entry points (`scripts/verify.ps1` / `scripts/verify.sh`), and the Definition of Done.
- **Requirements Covered**: `ENG-04`, `ENG-05`, `SEC-02`, `SEC-03`
- **Scope Fences**: No Scamfy product domain logic, database tables, PostgreSQL schemas, or Alembic migrations are implemented in this phase (strictly reserved for Phase 3).

---

## Detailed Task Breakdown

### Task 1: Next.js Frontend Scaffolding & Strict TypeScript Tooling
- **Action**:
  - Scaffold App Router directory tree: `app/cases/page.tsx`, `app/intel/page.tsx`, `app/report/page.tsx`, `components/ui/button.tsx`, `components/shared/risk-badge.tsx`, `lib/api/client.ts`, `lib/schemas/index.ts`, `lib/utils.ts`.
  - Configure `tsconfig.json` with strict compiler flags (`strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`, `@/*` path aliases).
  - Configure frontend linting via ESLint flat configuration (`eslint.config.mjs`, ignoring `backend/**` and build artifacts).
  - Configure Vitest component test harness with `vitest.config.ts` and `lib/test-sanity.test.ts`.
  - Define `package.json` scripts:
    - `npm run typecheck`: Runs `tsc --noEmit` for strict type validation.
    - `npm run lint`: Runs `eslint .` for codebase static analysis.
    - `npm run test`: Runs `vitest` in interactive/watch mode during active development.
    - `npm run test:run`: Runs `vitest run` in non-interactive CI mode.
- **Verification**: Run `npm run typecheck`, `npm run lint`, and `npm run test:run`.

### Task 2: FastAPI Backend Scaffolding & Python Tooling
- **Action**:
  - Scaffold backend directory structure: `backend/app/api/v1/`, `backend/app/core/`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/services/`, and `backend/tests/`.
  - Create `backend/requirements.txt` containing:
    - `fastapi>=0.115.0` & `uvicorn[standard]>=0.32.0`
    - `pydantic>=2.10.0` & `pydantic-settings>=2.6.0` (validated environment configuration)
    - `sqlalchemy>=2.0.36` (ORM engine foundation)
    - `slowapi>=0.1.9` (rate limiting)
    - `httpx>=0.28.0` (async HTTP client for upstream services)
    - `puremagic>=1.28` (magic-byte content signature validation)
    - `pytest>=8.3.0` & `pytest-asyncio>=0.24.0` (async testing framework)
    - `ruff>=0.8.0` (linter and code formatter)
  - Create `backend/pyproject.toml` configuring Ruff linter/formatter (line-length 100, py312 target) and Pytest asyncio mode (`asyncio_mode = "auto"`).
  - Create `backend/app/main.py` (FastAPI app factory, CORS middleware, global exception handlers masking internal traces `SEC-03`, and `/api/v1/health` endpoint).
  - Create `backend/app/core/config.py` (Pydantic `BaseSettings` for validated environment variables with fail-fast startup).
  - Create `backend/tests/test_health.py` (Health check and sanitized error response tests).
- **Verification**: Run `pytest backend/tests`, `ruff check backend/`, and `ruff format --check backend/`.

### Task 3: Environment Variable Templates & Secrets Isolation Policy
- **Action**:
  - Create frontend `scamfy/.env.example` defining public-only client variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_URL`).
  - Create backend `scamfy/backend/.env.example` defining private server-side variables (`NVIDIA_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `CORS_ORIGINS`).
  - Document strict secret boundary ensuring private credentials never enter frontend bundles (`SEC-02`).
  - Ensure `.gitignore` rules prevent real `.env` and `.env.local` files from being tracked in git.
- **Verification**: Verify git status ensures no real `.env` secrets are tracked.

### Task 4: Pre-Commit Enforcement & Canonical Local Verification Scripts
- **Action**:
  - Create the canonical local verification entry points:
    - `scripts/verify.ps1`: PowerShell runner for Windows environments (`powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`).
    - `scripts/verify.sh`: POSIX Shell runner for Linux, macOS, and CI pipelines (`bash scripts/verify.sh`).
    - Both scripts execute the full five-gate verification suite:
      1. Gate 1: Frontend TypeScript Typecheck (`npm run typecheck`)
      2. Gate 2: Frontend ESLint (`npm run lint`)
      3. Gate 3: Frontend Unit / Component Tests (`npm run test:run`)
      4. Gate 4: Backend Ruff Lint & Format Check (`ruff check backend/` & `ruff format --check backend/`)
      5. Gate 5: Backend Pytest Suite (`pytest backend/tests`)
  - Set up pre-commit enforcement mechanism matching `AGENTS.md`:
    - Configure git pre-commit hook in `.githooks/pre-commit` that invokes the platform's verification runner prior to allowing commits.
  - Author [**`docs/coding-standards.md`**](../../../docs/coding-standards.md) documenting:
    - Canonical final repository layout and module boundaries.
    - Architecture layering & trust boundaries (FastAPI trust boundary vs. client UI).
    - Provider error masking & sanitization rules (`SEC-03`).
    - Conventional git commit standards (`feat`, `fix`, `docs`, `refactor`, `test`, `plan`).
    - Phase Definition of Done checklist (`ENG-04`, `ENG-05`).
- **Verification**: Execute `scripts/verify.ps1` on Windows and `scripts/verify.sh` on POSIX systems, ensuring all 5 gates pass end-to-end.

---

## Canonical Verification Gates (Definition of Done)

| Gate | Verification Command | Passing Criteria |
| :--- | :--- | :--- |
| **Gate 1: Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors under strict mode (`tsc --noEmit`). |
| **Gate 2: Frontend Linting** | `npm run lint` | Zero ESLint warnings or errors (`eslint .`). |
| **Gate 3: Frontend Unit Tests** | `npm run test:run`<br>*(or `npm run test` in watch mode)* | All Vitest component/utility tests pass (`vitest run`). |
| **Gate 4: Backend Lint & Format** | `ruff check backend/`<br>`ruff format --check backend/` | Zero Python lint errors and all files formatted per Ruff rules. |
| **Gate 5: Backend Unit Tests** | `pytest backend/tests` | All health and exception sanitization tests pass. |
| **Canonical Local Suite** | `scripts/verify.ps1` (Win)<br>`scripts/verify.sh` (POSIX) | Full 5-gate pipeline succeeds in a single command. |
| **Pre-commit Integrity** | `.githooks/pre-commit` | Hook blocks non-compliant commits; runs local verification. |
| **Secrets Inspection** | Git tracking audit | No `.env` files, API keys, or credentials tracked (`SEC-02`). |
| **Planning Artifacts** | `VERIFICATION.md`<br>`SUMMARY.md` | Verification report and phase completion summary recorded in `.planning/`. |
