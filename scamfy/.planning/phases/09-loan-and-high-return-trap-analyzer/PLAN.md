# Phase 9: Loan & High-Return Trap Analyzer — Plan

- **Phase**: 09
- **Milestone**: Milestone 3 (Slice 3 - Financial Trap Engine & Regulatory Verification)
- **Status**: Planned 📋
- **Goal**: Implement Scamfy's deterministic predatory loan & high-yield calculation engine, backend rule expansions for 7-day lending and Ponzi traps, authoritative RBI regulatory verification checklists, interactive calculator UI, and analysis result integration.
- **Requirements Covered**: `LOAN-01`, `LOAN-02`, `LOAN-03`, `DET-02`, `DET-04`, `DET-05`, `UX-01`, `UX-03`, `UX-04`, `UX-05`
- **Scope Fences**: Zero direct bank account manipulation (`OOS-01`), zero recovery guarantees (`OOS-02`), zero automated legal determinations of guilt (`OOS-03`, `AI-05`), zero undocumented external government API fabrications (`OOS-05`), zero victim case center vault uploads (Phase 11).

---

## Detailed Task Breakdown

### Task 1: Pure Deterministic Financial Calculation Engines (`LOAN-01`, `LOAN-02`)
- **Action**:
  - Implement `scamfy/lib/loan-calculator.ts`:
    - Pure TypeScript functions with strict types:
      - `calculateLoanMetrics(params: LoanInputParams): LoanCalculationResult`: Computes net disbursement ($P - D$), total borrowing cost ($R - N$), effective period rate, simple APR, compounded EAR, and risk rating (`NORMAL`, `HIGH_COST`, `PREDATORY`).
      - `calculateYieldMetrics(params: YieldInputParams): YieldCalculationResult`: Computes annualized simple yield, compounded APY, daily/monthly breakdown, and comparative benchmark differentials against RBI Repo (5.50%) and Equity Index (12.5%).
      - `classifyLoanRisk(apr: number, tenureDays: number, deductionRatio: number)`: Flags predatory threshold (APR $> 100\%$ or tenure $< 30$ days with $> 20\%$ upfront deduction).
  - Implement `scamfy/backend/app/core/financial.py`:
    - Pure Python counterpart functions with Pydantic schemas for backend API consistency and testing parity.
  - Author test suites:
    - `scamfy/lib/__tests__/loan-calculator.test.ts`: Test standard loans, 7-day loan app presets, extreme boundary values, zero deduction, zero tenure validation guards.
    - `scamfy/backend/tests/test_financial.py`: Mirror Python unit test coverage with 100% boundary testing.
- **Verification**: `npm run test:run` and `python -m pytest backend/tests` pass.

### Task 2: Backend Predatory Loan & High-Yield Detection Rules (`DET-02`, `DET-04`, `DET-05`)
- **Action**:
  - Update `scamfy/backend/app/core/evaluator.py`:
    - Add rule family `RULE-LOAN-7DAY-TENURE`: Detects 7-day or weekly loan repayment traps with hyper-short tenure.
    - Add rule family `RULE-LOAN-UPFRONT-DEDUCTION`: Detects heavy upfront processing/service fee deductions before credit.
    - Add rule family `RULE-LOAN-CONTACT-HARVEST-BLACKMAIL`: Detects demands for contacts/gallery access or shaming threats.
    - Add rule family `RULE-LOAN-ADVANCE-FEE-APPROVAL`: Detects demands for upfront file charges, deposits, or insurance before sanctioning.
    - Add rule family `RULE-YIELD-GUARANTEED-DAILY-RETURN`: Detects guaranteed daily/weekly passive income or crypto doubling lures.
    - Update `detect_missing_evidence()` in `evaluator.py` to identify missing RBI Key Fact Statements (KFS) and unregistered entity disclosures per `DET-05`.
  - Update `scamfy/backend/tests/test_evaluator.py` and author `scamfy/backend/tests/test_loan_rules.py`:
    - Test positive scenarios (7-day app offers, advance fee scams, Ponzi bots).
    - Test negative control scenarios (genuine bank personal loan sanction letters, legitimate fixed deposit offers, regulated NBFC communications).
- **Verification**: `python -m pytest backend/tests` and `python -m ruff check backend/` pass.

### Task 3: Interactive Loan & High-Return Trap Analyzer UI Component (`LOAN-01`, `LOAN-02`, `LOAN-03`, `UX-03`, `UX-04`, `UX-05`)
- **Action**:
  - Implement `components/domain/loan-trap-analyzer.tsx`:
    - Responsive, accessible tabbed interface:
      - **Tab 1: Instant Loan Cost & APR Dissector (`LOAN-01`)**:
        - Form inputs & interactive range sliders for Stated Loan Amount, Upfront Processing Fee, Total Repayment Amount, and Tenure in Days.
        - Quick Preset Buttons: "7-Day Chinese Loan App", "Advance Fee Loan Scam", "Regulated Bank Personal Loan".
        - Real-Time Calculation Cards: Net Disbursed, Total Cost of Borrowing, Implied APR badge with color-coded risk level, and visual explanation.
      - **Tab 2: High-Return / Ponzi Impossibility Checker (`LOAN-01`, `LOAN-02`)**:
        - Inputs for Stated Investment Amount, Promised Return Rate (%), and Payout Period (Daily, Weekly, Monthly, Annual).
        - Annualized APY Calculation Card with mathematical reality check comparing promised yields against RBI Repo Rate (5.50%) and Top Mutual Funds (15%).
        - Warning notice citing the Banning of Unregulated Deposit Schemes Act (BUDS Act, 2019), explicitly decoupled from Scamfy's 24% and 50% product risk heuristics.
      - **Tab 3: RBI Sachet & NBFC Regulatory Verification Guide (`LOAN-03`)**:
        - Interactive step-by-step verification checklist for checking lender registration on RBI Sachet portal (`sachet.rbi.org.in`).
        - Mandatory RBI Digital Lending Compliance audit (KFS delivery, minimal app permissions, direct account-to-account transfer).
  - Author component test suite `components/__tests__/loan-trap-analyzer.test.tsx`:
    - Test tab switching, preset loading, slider changes, accessibility labels, and live APR calculation outputs.
- **Verification**: `npm run typecheck`, `npm run lint`, and `npm run test:run` pass.

### Task 4: Dedicated Standalone Page & Site Navigation (`app/loan-analyzer/page.tsx`)
- **Action**:
  - Create `app/loan-analyzer/page.tsx`:
    - Standalone page with rich metadata, hero explanation, educational FAQ, and embedded `LoanTrapAnalyzer` component.
  - Update header navigation in `components/layout/header.tsx` and footer links in `components/layout/footer.tsx` to include "Loan & Yield Analyzer".
  - Author test suite `components/__tests__/loan-analyzer-page.test.tsx`.
- **Verification**: `npm run typecheck` and `npm run test:run` pass.

### Task 5: Scam Check Results Integration & 6-Gate Canonical Verification (`UX-01`)
- **Action**:
  - Update `lib/mule.ts` or add `lib/loan.ts` with helper `isLoanOrYieldRisk(result: AnalysisResultDto): boolean`.
  - Update `components/domain/scam-check-result.tsx`:
    - When `isLoanOrYieldRisk` is detected, display a prominent contextual card: "Predatory Loan / High-Yield Trap Detected — Launch Loan Cost & APR Calculator".
  - Author integration test `components/__tests__/loan-integration.test.tsx`.
  - Run the full 6-gate verification pipeline (`npm run typecheck`, `npm run lint`, `npm run test:run`, `npm run build`, `python -m ruff check backend/`, `python -m pytest backend/tests`).
  - Author `VERIFICATION.md` and `SUMMARY.md`.
- **Verification**: All 6 verification gates pass cleanly.

---

## Canonical Verification Gates (Definition of Done)

| Gate | Command | Passing Criteria |
| :--- | :--- | :--- |
| **Gate 1: Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors (`tsc --noEmit`). |
| **Gate 2: Frontend Linting** | `npm run lint` | Zero ESLint warnings or errors (`eslint .`). |
| **Gate 3: Frontend Unit & Component Tests** | `npm run test:run` | All Vitest component, accessibility, and integration tests pass cleanly. |
| **Gate 4: Frontend Production Build** | `npm run build` | Next.js production build (`next build`) compiles cleanly. |
| **Gate 5: Backend Lint & Format** | `python -m ruff check backend/` | Backend adheres strictly to Ruff linting and formatting. |
| **Gate 6: Backend Pytest Suite** | `python -m pytest backend/tests` | FastAPI test suite passes with 100% test success. |
| **Canonical Local Suite** | `scripts/verify.ps1` (Win)<br>`scripts/verify.sh` (POSIX) | Full 6-gate pipeline passes in a single execution. |
