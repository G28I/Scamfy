# Scamfy — Engineering & Coding Standards

## 1. Final Repository Layout & Architecture Boundaries

Scamfy is structured as a **co-located modular monolith**, enforcing strict boundary separation between client-side user interfaces and server-side trust domains.

```
scamfy/
├── app/                    # Next.js App Router (UI routes & pages)
│   ├── (auth)/             # Authentication views (Clerk)
│   ├── (public)/           # Public landing & basic scam check
│   ├── cases/              # Victim Case Center dashboard & timeline
│   ├── intel/              # Public community scam pattern intelligence
│   └── report/             # Official reporting & 1930 guided flows
├── components/             # Reusable UI components (shadcn/ui + custom)
│   ├── ui/                 # Atomic design primitives (Button, Modal, Card, Badge)
│   └── shared/             # Domain components (RiskBanner, EvidenceUploader)
├── lib/                    # Frontend utilities, API clients, Zod schemas
│   ├── api/                # Typed fetch client to FastAPI backend
│   └── schemas/            # Zod validation schemas
├── backend/                # FastAPI Application & Server-Side Trust Boundary
│   ├── app/
│   │   ├── api/v1/         # Versioned route endpoints (health, check, cases, intel, report)
│   │   ├── core/           # Config, security, sanitized exceptions
│   │   ├── models/         # (Phase 3) SQLAlchemy ORM database models
│   │   ├── schemas/        # Pydantic v2 request/response schemas
│   │   └── services/       # Domain business logic (rules, nemotron, storage)
│   ├── tests/              # Pytest test suite (unit, integration, contracts)
│   ├── requirements.txt    # Python dependencies
│   └── pyproject.toml      # Ruff/Pytest configuration
├── scripts/                # Canonical local CI & verification entry points
│   ├── verify.ps1          # PowerShell verification runner
│   └── verify.sh           # POSIX Bash verification runner
├── .githooks/              # Git pre-commit enforcement hooks
├── docs/                   # Human & recruiter-facing architectural specifications
├── .planning/              # Canonical GSD planning & verification trail
├── package.json            # Frontend Next.js scripts & dependencies
└── .env.example            # Environment variable template
```

---

## 2. Trust Boundaries & Layering Principles

1. **FastAPI is the Sole Trust Boundary**:
   - The Next.js frontend code is completely untrusted. All database access, object storage signed URLs, Clerk role claims, and NVIDIA Nemotron inference must pass through FastAPI backend endpoints.
2. **Deterministic Rules Execute Independently (`AI-01`)**:
   - Rule-based red-flag logic evaluates first and takes absolute precedence over model advice.
3. **Strict Validation at Both Boundaries**:
   - Frontend forms validate inputs via **Zod**.
   - Backend endpoints enforce validation via **Pydantic v2**.

---

## 3. Error Handling & Provider Masking Policy (`SEC-03`)

- **Never Expose Internal Traces**:
  - Raw database exceptions, SQL queries, stack traces, and NVIDIA NIM timeout/500 errors must **never** be transmitted to the client.
- **Sanitized Response Envelope**:
  - All unhandled exceptions return a standardized sanitized JSON response:
    ```json
    {
      "error": "InternalServerError",
      "message": "An unexpected error occurred. Please try again or contact support.",
      "status": 500
    }
    ```
- **Auditable Server Logging**:
  - Full stack traces and debugging context are logged strictly server-side for operator inspection.

---

## 4. Git Commit Conventions & Branching Strategy

All commits follow the **Conventional Commits** format:

- `feat(<scope>)`: New product capability or feature slice.
- `fix(<scope>)`: Bug fix or security patch.
- `plan(<phase>)`: GSD planning artifacts, task plans, and phase context.
- `docs(<scope>)`: Documentation, specifications, or architectural notes.
- `refactor(<scope>)`: Code refactoring without changing observable behavior.
- `test(<scope>)`: Adding or updating test suites.

---

## 5. Canonical Local Verification & Pre-Commit Hooks

The repository provides two canonical local verification runners:
- **Windows**: `powershell -File scripts/verify.ps1`
- **POSIX**: `bash scripts/verify.sh`

### Git Pre-Commit Hook Configuration
To enable the pre-commit gate locally:
```powershell
git config core.hooksPath .githooks
```
Once configured, git automatically runs `scripts/verify.ps1` before every commit, blocking non-compliant code from entering git history.

---

## 6. Phase Definition of Done Checklist (`ENG-04`, `ENG-05`)

Before any GSD phase is marked complete:
- [ ] All planned tasks have been implemented.
- [ ] `npm run typecheck` passes with zero TypeScript errors under strict mode.
- [ ] `npm run lint` passes cleanly.
- [ ] `npm run test:run` passes all Vitest suites.
- [ ] `npm run build` generates a production build cleanly.
- [ ] `ruff check backend/` and `ruff format --check backend/` pass with zero issues.
- [ ] `pytest backend/tests` passes all test suites.
- [ ] No `.env` secrets or credentials are tracked in git (`SEC-02`).
- [ ] Verification evidence is recorded in `.planning/phases/<phase>/VERIFICATION.md`.
- [ ] Summary is recorded in `.planning/phases/<phase>/SUMMARY.md`.
