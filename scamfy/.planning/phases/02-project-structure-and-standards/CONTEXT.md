# Phase 2: Project Structure, GSD Setup & Coding Standards — Context

## Goal
Establish the clean modular monolith workspace structure, backend FastAPI foundation, Next.js frontend structure, testing frameworks (Pytest & Vitest/Playwright), linting/formatting tools (Ruff, ESLint), environment variable policy, and Definition of Done standards.

## Scope & Deliverables
1. **Unified Modular Directory Layout**:
   - Establish clean directory separation between Next.js frontend (`app/`, `components/`, `lib/`), FastAPI backend (`backend/app/`, `backend/core/`, `backend/api/`, `backend/tests/`), and documentation (`docs/`, `.planning/`).
2. **Backend Environment & Dependency Management**:
   - Setup `backend/pyproject.toml` or `backend/requirements.txt` with FastAPI, Pydantic v2, SQLAlchemy, Uvicorn, SlowAPI, Pytest, HTTPX.
   - Configure backend test harness with Pytest.
3. **Frontend Build & Testing Tooling**:
   - Verify Next.js App Router configuration, TypeScript strict mode, Tailwind CSS tokens.
   - Configure Vitest / Playwright test harness for web flows.
4. **Environment & Secrets Policy**:
   - Create `.env.example` templates for both frontend and backend.
   - Document credential isolation rules (`SEC-02`, `SEC-03`).
5. **Engineering Standards & Definition of Done (`docs/coding-standards.md`)**:
   - Document coding conventions, commit conventions, architectural layering, and testing gates (`ENG-04`, `ENG-05`).

## Linked Requirements
- `ENG-04`: Documented verification trail and quality gates for every phase.
- `ENG-05`: Architectural decisions and standards recorded in `.planning/`.
- `SEC-02`: Server-side isolation of secrets and credentials.
- `SEC-03`: Sanitized error handling and provider exception masking.
