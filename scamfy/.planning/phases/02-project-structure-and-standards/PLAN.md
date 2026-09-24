# Phase 2: Project Structure, GSD Setup & Coding Standards — Plan

- **Phase**: 02
- **Milestone**: 0 (Foundation)
- **Goal**: Establish the repository structure, FastAPI backend directory layout, testing harnesses (Pytest + Vitest), linting/formatting configs, `.env.example`, and engineering standards.
- **Requirements Covered**: `ENG-04`, `ENG-05`, `SEC-02`, `SEC-03`

---

## Tasks

### Task 1: Repository Layout & Backend Directory Scaffolding
- **Action**: Create the backend directory tree (`scamfy/backend/app/api/v1/`, `scamfy/backend/app/core/`, `scamfy/backend/app/models/`, `scamfy/backend/app/schemas/`, `scamfy/backend/app/services/`, `scamfy/backend/tests/`).
- **Files**:
  - `backend/requirements.txt` (FastAPI, Uvicorn, Pydantic v2, SQLAlchemy, Alembic, SlowAPI, Pytest, HTTPX, puremagic).
  - `backend/pyproject.toml` (Ruff and Pytest configuration).
  - `backend/app/main.py` (FastAPI application factory, CORS, exception handlers).
  - `backend/app/core/config.py` (Pydantic BaseSettings for environment variables).
  - `backend/tests/test_health.py` (Sanity health check test).
- **Verification**: Run `pytest` or verify import integrity.

### Task 2: Environment Variable Templates & Secrets Policy
- **Action**: Create root/project `.env.example` and `backend/.env.example` specifying all required configuration keys (`NVIDIA_API_KEY`, `DATABASE_URL`, `CLERK_SECRET_KEY`, `R2_*`, etc.) with documentation on secret isolation (`SEC-02`).
- **Verification**: Ensure no sensitive values or actual secrets are checked into git.

### Task 3: Coding Standards & Definition of Done Document
- **Action**: Create `docs/coding-standards.md` documenting:
  - Architecture layers and module boundaries.
  - Exception handling policy (sanitizing provider exceptions `SEC-03`).
  - Git commit conventions (`feat`, `fix`, `docs`, `refactor`, `test`).
  - Definition of Done checklist for every phase (`ENG-04`).
- **Verification**: Cross-reference against `GSD-SEED.md` and `docs/scope.md`.

### Task 4: Frontend & Backend Tooling Verification
- **Action**: Ensure `package.json` scripts, TypeScript build configs, and backend test runners execute cleanly without syntax or lint errors.
- **Verification**: Run `npm run lint` / `npm run build` checks.

---

## Verification Criteria
1. Backend directory structure created with `requirements.txt`, `pyproject.toml`, and basic health check test.
2. Complete `.env.example` templates created for both frontend and backend.
3. `docs/coding-standards.md` created covering Definition of Done and error sanitization (`SEC-03`).
4. Verification trail recorded in `.planning/phases/02-project-structure-and-standards/VERIFICATION.md`.
