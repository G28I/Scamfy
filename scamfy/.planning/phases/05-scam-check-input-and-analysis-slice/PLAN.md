# Phase 5: Scam Check Input & Analysis Slice — Plan

- **Phase**: 05
- **Milestone**: Milestone 1 (Slice 1 - Core Scam Check)
- **Status**: Complete ✅
- **Goal**: Implement Scamfy's complete first vertical tracer slice: suspicious message text input, structured entity extraction, deterministic heuristic risk assessment, Next.js BFF with Prisma persistence, and explainable results UI with actionable recovery guidance.
- **Requirements Covered**: `DET-01`, `DET-03`, `DET-04`, `UX-01`, `SEC-01`
- **Scope Fences**: Zero external government reporting APIs, zero money transfers, zero Nemotron NIM / LLM API calls in this phase (isolated to Phase 6), zero R2 storage uploads, zero community report mutations.

---

## Detailed Task Breakdown

### Task 1: FastAPI Entity Extractor & Heuristic Analysis Endpoint
- **Action**:
  - Implement Pydantic validation schemas in `backend/app/api/v1/schemas/analyze.py`:
    - `AnalyzeRequest`, `ExtractedEntities`, `AnalysisSignal`, `AnalyzeResponse`, `RiskLevel`, `ConfidenceTier`.
  - Implement entity extraction in `backend/app/core/extractors.py`:
    - Indian UPI VPAs, Indian mobile numbers (E.164 / 10-digit), URLs/domains, emails, bank accounts/IFSC, amounts (INR/USD), Telegram handles.
  - Implement deterministic rule evaluator in `backend/app/core/evaluator.py`:
    - Scores threat signals (urgent power cutoff, UPI PIN reverse collect, task commission lure, digital arrest, APK delivery) into `SAFE`, `CAUTION`, `SUSPICIOUS`, `HIGH_RISK`, `CRITICAL`.
  - Create endpoint `POST /api/v1/analyze` in `backend/app/api/v1/analyze.py` and mount onto `backend/app/api/v1/__init__.py`.
  - Author Pytest test suite `backend/tests/test_analyze.py` verifying entity extraction precision, schema validation, and risk score generation.
- **Verification**: `python -m pytest backend/tests` and `python -m ruff check backend/` pass cleanly.

### Task 2: Next.js BFF Route & Prisma Persistence (`app/api/check/route.ts`)
- **Action**:
  - Create `app/api/check/route.ts`:
    - Validates request payload (`text` length, non-empty).
    - Computes SHA-256 `inputHash` for tracking without storing plaintext PII in plain text search indexes.
    - Proxies request to FastAPI `/api/v1/analyze` (with internal timeout and sanitized error handling per `SEC-03`).
    - Persists check record into PostgreSQL via `prisma.scamCheck.create` (`overallRisk`, `primaryCategory`, `secondaryCategories`, `signals`, `extractedEntities`, `modelMetadata`, `actionRecommendations`, `inputHash`, `userId: null`).
    - Returns standardized analysis response to frontend.
  - Author Vitest API integration test in `lib/__tests__/check-api.test.ts`.
- **Verification**: `npm run typecheck` and `npm run test:run` pass cleanly.

### Task 3: Scam Check Domain UI Components (`components/domain/`)
- **Action**:
  - Create `components/domain/scam-check-form.tsx`:
    - Expanding `Textarea` with character counter and clear button.
    - Preset chips for 4 prevalent Indian scam scenarios:
      1. *Electricity Bill Cutoff*
      2. *Part-Time Task Scam*
      3. *UPI PIN Receive Lure*
      4. *Digital Arrest / Police Threat*
    - Accessible submit `Button` with loading spinner (`Loader2`) and keyboard handling.
  - Create `components/domain/scam-check-result.tsx`:
    - Renders `RiskBadge` with large semantic pill.
    - Renders `ConfidenceMeter` for analysis signal strength.
    - Renders `UrgencyBanner` with helpline CTA when risk is `CRITICAL` or `HIGH_RISK` (`UX-02`).
    - Renders **Recommended Immediate Actions Box** with actionable recovery checklist (`UX-01`).
    - Renders **Extracted Indicators Grid** utilizing `IndicatorTag` with 1-click clipboard copy (`DET-03`).
    - Renders **Detected Signals List** with evidence quotes and threat rationale (`DET-04`).
- **Verification**: `npm run typecheck` and `npm run lint` pass cleanly.

### Task 4: Home Page Integration (`app/page.tsx`) & Navigation
- **Action**:
  - Update `app/page.tsx`:
    - Replace Next.js starter boilerplate with full Scamfy scam analysis homepage.
    - Responsive layout with hero section, clear privacy reassurance (`SEC-01`), analysis form, and live results container.
    - Seamless transition from form submission to animated results presentation with `StateFeedback` error handling and retry support (`UX-05`).
- **Verification**: `npm run build` compiles static and dynamic pages with zero errors.

### Task 5: Component & Behavioral Testing Suite
- **Action**:
  - Author comprehensive test suite in `components/__tests__/scam-check.test.tsx`:
    - Form submission event handling and API integration.
    - Preset template selection populating the text area.
    - Rendering of all risk tiers (`SAFE` through `CRITICAL`).
    - Clipboard copy interaction on extracted indicator tags.
    - Accessibility compliance (visible focus, ARIA live feedback, keyboard operability).
- **Verification**: `npm run test:run` passes all test files.

---

## Canonical Verification Gates (Definition of Done)

| Gate | Command | Passing Criteria |
| :--- | :--- | :--- |
| **Gate 1: Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors (`tsc --noEmit`). |
| **Gate 2: Frontend Linting** | `npm run lint` | Zero ESLint warnings or errors (`eslint .`). |
| **Gate 3: Frontend Unit & Component Tests** | `npm run test:run` | All Vitest component, accessibility, and integration tests pass cleanly. |
| **Gate 4: Frontend Production Build** | `npm run build` | Next.js production build (`next build`) compiles cleanly. |
| **Gate 5: Backend Lint & Format** | `ruff check backend/`<br>`ruff format --check backend/` | Backend adheres strictly to Ruff linting and formatting. |
| **Gate 6: Backend Pytest Suite** | `pytest backend/tests` | FastAPI test suite passes cleanly with 100% test success. |
| **Canonical Local Suite** | `scripts/verify.ps1` (Win)<br>`scripts/verify.sh` (POSIX) | Full 6-gate pipeline passes in a single execution. |
