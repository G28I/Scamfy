# Phase 2: Project Structure, GSD Setup & Coding Standards — Research

## 1. Modular Monolith Architecture Pattern

To prevent circular dependencies and avoid premature microservices complexity while maintaining clean separation of concerns, the repository is structured as a **co-located modular monolith**:

```
scamfy/ (repository root)
├── .githooks/              # Git hooks (pre-commit verification enforcement)
├── scripts/                # Canonical local CI & verification entry points
│   ├── verify.ps1          # Windows PowerShell verification runner
│   └── verify.sh           # POSIX Bash verification runner
└── scamfy/                 # Application root
    ├── .planning/          # Canonical GSD planning & verification trail
    │   └── phases/
    │       ├── 01-safety-and-threat-model/
    │       ├── 02-project-structure-and-standards/
    │       │   ├── CONTEXT.md
    │       │   ├── RESEARCH.md
    │       │   ├── PLAN.md
    │       │   ├── VERIFICATION.md
    │       │   └── SUMMARY.md
    │       └── 03-core-data-model-and-migrations/
    ├── app/                # Next.js App Router (UI routes & pages)
    │   ├── cases/          # Victim Case Center view
    │   ├── intel/          # Public community scam patterns
    │   ├── report/         # Official reporting & 1930 guided flow
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/         # Reusable UI components
    │   ├── ui/             # Atomic UI primitives (Button)
    │   └── shared/         # Shared domain components (RiskBadge)
    ├── lib/                # Frontend utilities, API clients, Zod schemas
    │   ├── api/            # Typed fetch client (client.ts)
    │   ├── schemas/        # Zod validation schemas (index.ts)
    │   ├── test-sanity.test.ts # Vitest sanity & component test suite
    │   └── utils.ts        # Styling and class merging utilities
    ├── backend/            # FastAPI Application & Server-side Trust Boundary
    │   ├── app/
    │   │   ├── api/v1/     # Route endpoints (health.py)
    │   │   ├── core/       # Settings & config (config.py with pydantic-settings)
    │   │   ├── models/     # (Deferred to Phase 3) SQLAlchemy ORM database models
    │   │   ├── schemas/    # Pydantic v2 request/response schemas
    │   │   ├── services/   # Domain services (rules, nemotron, storage)
    │   │   └── main.py     # FastAPI app factory with SEC-03 error sanitization
    │   ├── tests/          # Pytest async test suite (test_health.py)
    │   ├── requirements.txt # Python dependencies (pydantic-settings, fastapi, etc.)
    │   ├── pyproject.toml  # Ruff linter/formatter & Pytest configuration
    │   └── .env.example    # Backend environment variable template
    ├── docs/               # Human and architectural documentation
    │   ├── coding-standards.md # Engineering standards & DoD
    │   ├── safety-spec.md
    │   ├── scam-taxonomy.md
    │   ├── threat-model.md
    │   └── user-roles.md
    ├── package.json        # Frontend Next.js scripts & dependencies
    ├── tsconfig.json       # Strict TypeScript compiler configuration
    ├── eslint.config.mjs   # ESLint flat configuration (ignoring backend/)
    ├── vitest.config.ts    # Vitest runner configuration
    └── .env.example        # Frontend environment variable template
```

---

## 2. Tooling, Linter & Verification Standards

### Frontend Tooling
- **TypeScript**: Strict mode enforced in `tsconfig.json` (`strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`).
- **ESLint**: Next.js App Router rules via `eslint.config.mjs`, configured to ignore `backend/**` to prevent Python syntax collision.
- **Vitest**: Fast Vite-native unit testing runner (`vitest.config.ts`).
- **NPM Script Contracts**:
  - `npm run typecheck`: Runs `tsc --noEmit` (strict non-emitting type check).
  - `npm run lint`: Runs `eslint .` across all frontend code.
  - `npm test`: Runs `vitest` in interactive watch mode for local development.
  - `npm run test:run`: Runs `vitest run` in non-interactive CI mode for verification pipelines.

### Backend Tooling
- **Python**: Python 3.12+ runtime.
- **Framework & Config**: FastAPI, Pydantic v2, and `pydantic-settings` (`BaseSettings`) for fail-fast environment variable validation.
- **Linter & Formatter**: Ruff (`ruff check backend/` and `ruff format --check backend/`) configured via `backend/pyproject.toml`.
- **Test Runner**: Pytest with `pytest-asyncio` (`asyncio_mode = "auto"`) executing `pytest backend/tests`.

---

## 3. Platform-Specific Verification Expectations

To provide seamless development across operating systems and CI environments, canonical verification scripts are implemented for both PowerShell and POSIX shells:

| Platform | Verification Command | Script Path | Platform Considerations |
| :--- | :--- | :--- | :--- |
| **Windows (PowerShell)** | `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` | `scripts/verify.ps1` | Uses `python` executable directly; tests all 5 gates sequentially. |
| **POSIX (Linux / macOS / CI)** | `bash scripts/verify.sh` | `scripts/verify.sh` | Dynamically checks for `python3` or `python`; makes script executable via `chmod +x`. |

Both scripts enforce the identical 5 gates:
1. Gate 1: Frontend Typecheck (`npm run typecheck`)
2. Gate 2: Frontend Lint (`npm run lint`)
3. Gate 3: Frontend Tests (`npm run test:run`)
4. Gate 4: Backend Ruff Lint & Format (`ruff check` & `ruff format --check`)
5. Gate 5: Backend Pytest (`pytest backend/tests`)

---

## 4. Environment Variable Isolation Policy (`SEC-02`)

- **Public Client Variables (`NEXT_PUBLIC_*`)**:
  - Defined in `scamfy/.env.example`: Only public URLs and Clerk publishable keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_URL`).
- **Private Server Variables**:
  - Defined in `scamfy/backend/.env.example`: `NVIDIA_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `CORS_ORIGINS`.
  - Private credentials are strictly quarantined on the backend runtime and never bundled into client JavaScript.
