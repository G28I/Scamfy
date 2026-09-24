# Phase 2: Project Structure, GSD Setup & Coding Standards — Research

## 1. Modular Monolith Architecture Pattern

To prevent circular dependencies and avoid premature microservices complexity while maintaining clean separation of concerns, the repository is structured as a **co-located modular monolith**:

```
scamfy/
├── app/                    # Next.js App Router (UI routes & pages)
│   ├── (auth)/             # Authentication views (Clerk)
│   ├── (public)/           # Public landing, basic scam check
│   ├── cases/              # Victim Case Center dashboard & timeline
│   ├── intel/              # Public community scam patterns
│   └── report/             # Official reporting & 1930 guided flows
├── components/             # Reusable UI components (shadcn/ui + custom)
│   ├── ui/                 # Atomic design primitives (Button, Modal, Card, Badge)
│   └── shared/             # Domain components (RiskBanner, EvidenceUploader)
├── lib/                    # Frontend utilities, API clients, Zod schemas
│   ├── api/                # Typed fetch client to FastAPI backend
│   └── schemas/            # Zod validation schemas
├── backend/                # FastAPI Application & Trust Boundary
│   ├── app/
│   │   ├── api/v1/         # Route endpoints (health, check, cases, intel, report)
│   │   ├── core/           # Config, security, sanitized exceptions
│   │   ├── models/         # (Deferred to Phase 3) SQLAlchemy ORM database models
│   │   ├── schemas/        # Pydantic v2 request/response schemas
│   │   └── services/       # Domain business logic (rules, nemotron, storage)
│   ├── tests/              # Pytest test suite (unit, integration, contracts)
│   ├── requirements.txt    # Python dependencies
│   └── pyproject.toml      # Ruff/Pytest configuration
├── scripts/                # Canonical local CI & verification entry points
│   ├── verify.ps1          # PowerShell verification runner
│   └── verify.sh           # Bash verification runner
├── .githooks/              # Pre-commit enforcement hooks
├── docs/                   # Human & recruiter-facing architectural specifications
├── .planning/              # Canonical GSD planning & verification trail
├── package.json            # Frontend Next.js scripts & dependencies
└── .env.example            # Environment variable template
```

---

## 2. Tooling, Linter & Verification Standards

- **Frontend**:
  - TypeScript in `strict` mode (`noImplicitAny`, `noUncheckedIndexedAccess`).
  - ESLint with Next.js core web vitals rules.
  - Prettier with consistent 2-space indentation.
  - Vitest for frontend unit/component tests.
- **Backend**:
  - Python 3.11+ with FastAPI & Pydantic v2.
  - Ruff for ultra-fast linting (`ruff check backend/`) and code formatting check (`ruff format --check backend/`).
  - Pytest with `pytest-asyncio` for asynchronous endpoint testing.
- **Verification Runners**:
  - Canonical entry points `scripts/verify.ps1` and `scripts/verify.sh` enforce the complete 5-gate pipeline locally before code is committed.

---

## 3. Environment Variable Isolation Policy (`SEC-02`)

- **Public Client Variables (`NEXT_PUBLIC_*`)**:
  - Only non-sensitive URLs and public Clerk publishable keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_URL`).
- **Private Server Variables**:
  - `NVIDIA_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` reside exclusively in the backend runtime environment.
  - No secrets are ever packaged into frontend bundles.
