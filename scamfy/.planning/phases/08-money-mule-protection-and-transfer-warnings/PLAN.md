# Phase 8: Money-Mule Protection & Transfer Warnings — Plan

- **Phase**: 08
- **Milestone**: Milestone 2 (Slice 2 - Community Intel & Mule Shield)
- **Status**: Planned 📋
- **Goal**: Implement Scamfy's money-mule detection engine, interruptive pre-transfer warnings with legal liability education, and an interactive step-by-step guided workflow for preserving evidence and handling already-received funds.
- **Requirements Covered**: `MULE-01`, `MULE-02`, `MULE-03`, `UX-02`, `UX-03`, `UX-04`, `UX-05`
- **Scope Fences**: Zero direct bank account credential access or API fund freezing (`OOS-01`), zero chargeback or money recovery guarantees (`OOS-02`), zero automated legal/criminal determinations of guilt (`OOS-03`, `AI-05`), zero predatory loan APR calculators (Phase 9), zero automated 1930 API submissions (Phase 10), zero full victim case center vaults or R2 document storage (Phase 11).

---

## Detailed Task Breakdown

### Task 1: Backend Deterministic Mule Rules & Pattern Detection Engine (`MULE-01`)
- **Action**:
  - Update `backend/app/core/evaluator.py`:
    - Add `RULE-MONEY-MULE-FORWARDING`: Detects requests to receive funds in personal accounts and forward/transfer them to third-party accounts or convert to crypto/cash with commission lures (`MULE-01`).
    - Add `RULE-ACCOUNT-RENTAL-P2P`: Detects schemes renting personal/corporate bank accounts or UPI handles for gaming/crypto P2P arbitrage, expanded to cover campus/messaging platform procuring (`MULE-01`).
    - Add `RULE-OVERPAYMENT-REVERSAL-MULE`: Detects fake accidental transfer claims asking victim to refund excess money to a different account/UPI ID (`MULE-01`).
  - Update `backend/app/core/extractors.py`:
    - Add pattern extractors for mule-related indicators (commission percentages, account rental keywords, forwarding instructions).
  - Update `backend/app/api/v1/schemas/analyze.py`:
    - Ensure `MONEY_MULE_RECRUITMENT` is recognized across categories and signals.
  - Author test suite `backend/tests/test_mule_rules.py`:
    - Test all mule variants: task salary forwarding, account rental, crypto P2P arbitrage, overpayment refund tricks, and benign job messages.
- **Verification**: `python -m pytest backend/tests` passes 100%.

### Task 1.1: Student-Specific Money-Mule Detection Expansion (`MULE-01`)
- **Action**:
  - Extend `backend/app/core/evaluator.py` with 5 new dedicated student recruitment rule families and multi-signal dimension matching:
    1. `RULE-MULE-LOAN-ASSISTANCE-PRETEXT`: Loan processing assistance requesting account access, passbooks, debit cards, or blank signed cheques.
    2. `RULE-MULE-SCHOLARSHIP-JOB-COMMISSION`: Fake scholarships/internships/part-time jobs requiring personal account fund routing or student peer account arrangement for commission.
    3. `RULE-MULE-BANKING-INSTRUMENT-CAPTURE`: Standalone requests to surrender blank signed cheques, ATM cards/PINs, passbooks, SIM cards, OTP forwarding, or NetBanking credentials.
    4. `RULE-MULE-INTERMEDIARY-REASSURANCE`: Deceptive risk minimization ("only an intermediary", "harmless", "no risk", "not responsible") combined with fund routing or account use instructions.
    5. `RULE-MULE-CORPORATE-ACCOUNT-CREATION`: Requests to open a personal bank account/UPI identity for a purported company/client to operate.
    6. Extended `RULE-ACCOUNT-RENTAL-P2P`: Added support for campus procuring and Telegram/WhatsApp account rental networks.
  - Update `detect_missing_evidence()` in `evaluator.py` to identify missing corporate remittance agreements / lender credentials for `MONEY_MULE_RECRUITMENT` per `DET-05`.
  - Extend `backend/tests/test_mule_rules.py` with 22 unit test scenarios:
    - 6 positive test cases covering all student recruitment vectors.
    - 8 negative control test cases verifying zero false positives on legitimate salaries, expense reimbursements, family transfers, genuine scholarships, verified bank loan sanction letters, and ordinary internships.
  - Update `backend/tests/test_evaluator.py` rule count and uniqueness assertions to 18 active rules.
- **Acceptance Criteria**:
  - Contextual multi-signal rule matching prevents keyword false positives on benign banking communications.
  - Standalone credential harvesting triggers immediate `CRITICAL` risk without requiring a recruitment funnel.
  - All 54 backend pytest tests pass cleanly.

### Task 2: Frontend Threat Analysis BFF Integration & Types (`MULE-01`, `MULE-02`)
- **Action**:
  - Update `scamfy/lib/schemas/index.ts` and `scamfy/app/api/check/route.ts`:
    - Add helper `isMoneyMuleRisk(result: AnalysisResultDto): boolean` to reliably detect mule-related signals and categories.
  - Author test suite `scamfy/lib/__tests__/mule-helpers.test.ts`:
    - Verify helper correctly identifies mule categories, signals, and edge cases.
- **Verification**: `npm run test:run` passes.

### Task 3: Interruptive Pre-Transfer Warning Modal & Safe Action Directives (`MULE-02`, `UX-02`, `UX-03`, `UX-04`)
- **Action**:
  - Implement `components/domain/pre-transfer-warning-modal.tsx`:
    - Accessible Dialog modal auto-triggering or prominent when `isMoneyMuleRisk(result)` is detected.
    - Clear legal liability warning under Indian law: accomplice liability under PMLA, IPC 420, Section 102 CrPC account freeze consequences.
    - Immediate safe-action cards:
      1. **DO NOT SEND OR FORWARD ANY MONEY**
      2. **DO NOT TOUCH OR WITHDRAW RECEIVED FUNDS**
      3. **REFUSE AND BLOCK THE SENDER**
    - High-urgency styling with WCAG AA compliant contrast and keyboard accessibility (Tab trapping, Escape).
    - Seamless CTAs: "I haven't sent money (View Safe Actions)" & "Money was already received into my account (Open Guided Protocol)".
  - Author component test suite `components/__tests__/pre-transfer-warning-modal.test.tsx`.
- **Verification**: `npm run typecheck` and `npm run test:run` pass.

### Task 4: Interactive Guided Workflow for Received Funds & Evidence Preservation (`MULE-03`, `UX-05`)
- **Action**:
  - Implement `components/domain/mule-received-funds-guide.tsx`:
    - 4-Step Guided Wizard:
      - **Step 1: Immediate Freeze & No-Action Protocol**: Plain explanation why spending or returning money to the scammer is illegal and dangerous.
      - **Step 2: Bank Notice & Lien Generator**: Interactive form to enter transaction UTR/reference, date, and amount, generating a copyable formal written notification to the bank nodal officer / branch manager requesting a debit lien.
      - **Step 3: Evidence Preservation Checklist**: Interactive checklist for chat logs, sender phone numbers, payment receipts, SMS alerts, and fake job contracts.
      - **Step 4: Official Reporting Handoff (1930 / cybercrime.gov.in)**: Guidance on registering an informational report as an unwitting target before law enforcement freezes the account network.
  - Implement dedicated standalone page `app/mule-protection/page.tsx` for direct URL access, bookmarking, and campus safety awareness.
  - Author component test suite `components/__tests__/mule-received-funds-guide.test.tsx`.
- **Verification**: `npm run typecheck`, `npm run lint`, and `npm run test:run` pass.

### Task 5: Integration into Scam Check Results & 6-Gate Verification Suite
- **Action**:
  - Integrate `PreTransferWarningModal` and `MuleReceivedFundsGuide` trigger into `components/domain/scam-check-result.tsx`.
  - Author comprehensive integration test `components/__tests__/mule-integration.test.tsx`.
  - Run full 6-gate canonical verification suite (`scripts/verify.ps1`).
  - Author `VERIFICATION.md` and `SUMMARY.md`.
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
