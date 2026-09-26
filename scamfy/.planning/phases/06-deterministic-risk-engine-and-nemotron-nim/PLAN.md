# Phase 6: Deterministic Risk Engine + NVIDIA Nemotron Analysis — Plan

- **Phase**: 06
- **Milestone**: Milestone 1 (Slice 1 - Core Scam Check)
- **Status**: 🟢 Complete
- **Goal**: Implement Scamfy's hybrid scam evaluation engine combining an expanded deterministic threat rule evaluator with server-side NVIDIA Nemotron NIM inference (`nvidia/llama-3.1-nemotron-70b-instruct`), typed Pydantic contract validation, explainable psychological tactic detection, and explicit missing evidence modeling.
- **Requirements Covered**: `DET-02`, `DET-05`, `AI-01`, `AI-02`, `AI-03`, `AI-04`, `AI-05`, `ENG-01`, `ENG-02`
- **Scope Fences**: Zero community reporting database mutations (Phase 7), zero money mule transfer warnings (Phase 8), zero loan APR calculators (Phase 9), zero 1930 portal automated API submissions (Phase 10), zero victim case vaults or R2 uploads (Phase 11).

---

## Detailed Task Breakdown

### Task 1: Expanded Deterministic Rule Engine & Uncertainty Modeling
- **Action**:
  - Update `backend/app/core/evaluator.py`:
    - Expand rule set to 10 high-prevalence Indian cyber scam rules:
      1. `RULE-UPI-PIN-REVERSE` (Critical)
      2. `RULE-DIGITAL-ARREST-EXTORTION` (Critical)
      3. `RULE-ELECTRICITY-DISCONNECTION` (Critical)
      4. `RULE-CUSTOMS-PARCEL-EXTORTION` (Critical)
      5. `RULE-LOAN-APK-HARASSMENT` (Critical)
      6. `RULE-PART-TIME-TASK-COMMISSION` (High Risk)
      7. `RULE-BANK-KYC-PAN-PHISHING` (High Risk)
      8. `RULE-CRYPTO-STOCK-VIP-TRAP` (High Risk)
      9. `RULE-FAKE-CUSTOMER-CARE` (Suspicious)
      10. `RULE-SUSPICIOUS-SHORT-URL` (Suspicious)
    - Implement uncertainty and missing evidence identification (`DET-05`) for unverified sender claims, unknown caller identity, and lack of transaction references.
    - Ensure deterministic rules run independently of the LLM (`AI-01`).
  - Create dedicated unit test suite `backend/tests/test_evaluator.py` verifying 100% test coverage across all rules and uncertainty conditions (`ENG-01`).
- **Verification**: `python -m pytest backend/tests/test_evaluator.py` passes with 100% success.

### Task 2: NVIDIA Nemotron NIM Client & Pydantic Schema Contracts
- **Action**:
  - Implement `backend/app/core/nemotron.py`:
    - Async HTTP client connecting to NVIDIA NIM API (`https://integrate.api.nvidia.com/v1/chat/completions`) using `settings.NVIDIA_API_KEY` and `settings.NEMOTRON_MODEL_SLUG` (`AI-02`, `SEC-02`).
    - Structured system prompt enforcing JSON generation, adversarial injection resistance, and forensic scam analysis.
    - Define typed Pydantic contract `NemotronAnalysisOutput` in `backend/app/api/v1/schemas/analyze.py` (`AI-03`).
    - Implement graceful error handling: if `NVIDIA_API_KEY` is not configured or upstream request fails/times out, fall back cleanly to deterministic rules with `model_metadata.ai_assisted = False`.
    - Preserve provenance metadata: `model_slug`, `prompt_version`, `temperature`, `latency_ms`, and legal disclaimer (`AI-04`, `AI-05`).
  - Author automated contract and mock tests in `backend/tests/test_nemotron.py` (`ENG-02`).
- **Verification**: `python -m pytest backend/tests/test_nemotron.py` passes cleanly.

### Task 3: Hybrid Risk Arbitrator & Endpoint Integration
- **Action**:
  - Update `backend/app/api/v1/analyze.py` and `backend/app/core/evaluator.py`:
    - Combine entity extraction, deterministic rule results, and Nemotron NIM inference.
    - Enforce safety invariant: deterministic `CRITICAL` risk cannot be downgraded by LLM (`AI-01`).
    - Merge detected signals, psychological pressure tactics, missing evidence notes, and actionable recommendations.
    - Return enhanced `AnalyzeResponse`.
  - Update `backend/tests/test_analyze.py` for end-to-end endpoint verification.
- **Verification**: `python -m pytest backend/tests` and `python -m ruff check backend/` pass.

### Task 4: Next.js BFF Route & Explainable UI Updates
- **Action**:
  - Update `app/api/check/route.ts`:
    - Extend DTOs and runtime type guard `isValidAnalysisPayload` with `psychological_tactics`, `missing_evidence`, and `synthesis_summary`.
    - Persist enhanced analysis payload to PostgreSQL via Prisma.
  - Update `components/domain/scam-check-result.tsx`:
    - Render **AI Synthesis Summary Card** explaining the threat mechanics in plain language.
    - Render **Psychological Tactics Badges** (e.g. "False Authority", "Urgency Trap", "Greed Lure").
    - Render **Missing Evidence / Uncertainty Banner** (`DET-05`) when analysis detects missing sender or transaction proof.
    - Render **Engine Provenance Tag** showing active model metadata and disclaimer (`AI-04`, `AI-05`).
- **Verification**: `npm run typecheck` and `npm run lint` pass cleanly.

### Task 5: Component & End-to-End Test Suite
- **Action**:
  - Update `components/__tests__/scam-check.test.tsx` and `lib/__tests__/check-route.test.ts`:
    - Test rendering of psychological tactic tags, AI synthesis summary, missing evidence notices, and engine metadata.
    - Test BFF route validation with enhanced hybrid schema.
  - Run full 6-gate verification suite (`scripts/verify.ps1`).
- **Verification**: `scripts/verify.ps1` passes all 6 gates with zero errors.

---

## Canonical Verification Gates (Definition of Done)

| Gate | Command | Passing Criteria |
| :--- | :--- | :--- |
| **Gate 1: Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors (`tsc --noEmit`). |
| **Gate 2: Frontend Linting** | `npm run lint` | Zero ESLint warnings or errors (`eslint .`). |
| **Gate 3: Frontend Unit & Component Tests** | `npm run test:run` | All Vitest component, accessibility, and integration tests pass cleanly. |
| **Gate 4: Frontend Production Build** | `npm run build` | Next.js production build (`next build`) compiles cleanly. |
| **Gate 5: Backend Lint & Format** | `ruff check backend/`<br>`ruff format --check backend/` | Backend adheres strictly to Ruff linting and formatting. |
| **Gate 6: Backend Pytest Suite** | `pytest backend/tests` | FastAPI test suite passes with 100% test success. |
| **Canonical Local Suite** | `scripts/verify.ps1` (Win)<br>`scripts/verify.sh` (POSIX) | Full 6-gate pipeline passes in a single execution. |
