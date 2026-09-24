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
│   │   ├── api/v1/         # Route endpoints (check, cases, intel, report, auth)
│   │   ├── core/           # Config, database session, security, exceptions
│   │   ├── models/         # SQLAlchemy ORM database models
│   │   ├── schemas/        # Pydantic v2 request/response schemas
│   │   └── services/       # Domain business logic (rules, nemotron, storage, crypto)
│   ├── tests/              # Pytest test suite (unit, integration, contracts)
│   ├── requirements.txt    # Python dependencies
│   └── pyproject.toml      # Ruff/Pytest configuration
├── docs/                   # Human & recruiter-facing architectural specifications
├── .planning/              # Canonical GSD planning & verification trail
├── package.json            # Frontend Next.js scripts & dependencies
└── .env.example            # Environment variable template
```

---

## 2. Tooling & Linter Standards

- **Frontend**:
  - TypeScript in `strict` mode.
  - ESLint with Next.js core web vitals rules.
  - Vitest for frontend unit/component tests, Playwright for E2E browser journeys.
- **Backend**:
  - Python 3.11+ with FastAPI & Pydantic v2.
  - Ruff for ultra-fast linting and code formatting (`ruff check`, `ruff format`).
  - Pytest with `pytest-asyncio` for unit and contract testing.

---

## 3. Environment Variable Isolation Policy (`SEC-02`)

- **Public Client Variables (`NEXT_PUBLIC_*`)**:
  - Only non-sensitive URLs and public Clerk publishable keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_URL`).
- **Private Server Variables**:
  - `NVIDIA_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` reside exclusively in the backend runtime environment.
  - No secrets are ever packaged into frontend bundles.
