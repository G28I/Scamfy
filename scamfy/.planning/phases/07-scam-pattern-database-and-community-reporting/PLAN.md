# Phase 7: Scam Pattern Database & Community Reporting (Slice 2) — Plan

- **Phase**: 07
- **Milestone**: Milestone 2 (Slice 2 - Community Intel & Mule Shield)
- **Status**: Ready for Execution ⚪
- **Goal**: Implement Scamfy's community scam intelligence pipeline, indicator deduplication engine, public threat intelligence directory with strict verification tier separation, and audit-logged moderation console.
- **Requirements Covered**: `REP-01`, `REP-02`, `REP-03`, `REP-04`, `REP-05`, `SEC-06`, `UX-03`, `UX-04`, `UX-05`
- **Scope Fences**: Zero money mule transfer warnings (Phase 8), zero predatory loan APR calculators (Phase 9), zero 1930 portal automated API submissions (Phase 10), zero victim case vaults or R2 uploads (Phase 11), zero public vigilante blacklists or doxxing feeds (`OOS-04`).

---

## Detailed Task Breakdown

### Task 1: Indicator Normalizer & Pattern Deduplication Service
- **Action**:
  - Implement `lib/indicators.ts`:
    - Identifier normalizers for `UPI_ID`, `PHONE`, `DOMAIN`, `HANDLE`, `BANK_ACC`, `SCRIPT`.
    - Validation functions checking indicator syntax before database ingestion.
  - Implement `lib/services/pattern-service.ts`:
    - `ingestCommunityReport(data, reporterUserId)`: Normalizes indicator, queries/upserts `ScamPattern` composite key `[indicatorType, indicatorValue]`, increments `reportCount`, updates `lastReportedAt`, and creates `CommunityReport` linked to `patternId` (`REP-01`, `REP-02`, `REP-03`).
    - Enforce invariant: `reportCount` incrementing alone NEVER auto-promotes pattern to `MODERATOR_VERIFIED`.
    - `listPublicPatterns(filters)`: Queries patterns strictly segmented by `verificationStatus` (`MODERATOR_VERIFIED` vs `COMMUNITY_FLAGGED` / `UNVERIFIED`) with search, pagination, and sanitization of private reporter/moderator data (`REP-04`).
  - Author comprehensive Vitest test suite `lib/__tests__/pattern-service.test.ts`.
- **Verification**: `npm run test:run` passes with 100% test success.

### Task 2: Community Report Submission BFF Route & Modal Dialog
- **Action**:
  - Implement Next.js BFF route `app/api/reports/route.ts`:
    - `POST /api/reports`: Validates authenticated user session/identity, validates payload shape, delegates to `ingestCommunityReport`, returns 201 with report ID and pattern metadata.
    - `GET /api/reports`: Returns authenticated user's submitted reports with status tracking.
  - Implement `components/domain/report-indicator-dialog.tsx`:
    - Accessible Dialog modal with indicator type selector, input formatting helpers, category dropdown, description textarea, non-legal/anti-doxxing disclosure, and submission feedback.
    - Full keyboard accessibility and focus trapping (`UX-03`, `UX-04`, `UX-05`).
  - Author route test suite `lib/__tests__/reports-route.test.ts`.
- **Verification**: `npm run typecheck` and `npm run test:run` pass.

### Task 3: Public Community Intelligence Directory (/intel)
- **Action**:
  - Implement Next.js BFF route `app/api/patterns/route.ts`:
    - `GET /api/patterns`: Returns explicit metadata with `verificationStatus` (`MODERATOR_VERIFIED`, `COMMUNITY_FLAGGED`, `UNVERIFIED`). Excludes private reporter PII and internal moderator notes.
  - Update `app/intel/page.tsx`:
    - Search and filter bar (by Indicator Type, Risk Level, Verification Tier, Category).
    - Distinct Tabs interface:
      - Tab 1: **Verified Threat Signatures (`MODERATOR_VERIFIED`)** with shield badge and verified provenance.
      - Tab 2: **Unverified Community Reports (`COMMUNITY_FLAGGED` / `UNVERIFIED`)** with explicit unverified disclosure banner and distinct visual styling.
    - Threat cards displaying indicator badges, frequency count, first/last seen dates, category tags, and safe-action recommendations.
    - "Report Suspicious Indicator" CTA triggering `ReportIndicatorDialog`.
  - Author component test suite `components/__tests__/intel-directory.test.tsx`.
- **Verification**: `npm run typecheck`, `npm run lint`, and `npm run test:run` pass.

### Task 4: Moderator Review API & Audit Logging Console
- **Action**:
  - Implement Next.js BFF route `app/api/admin/reports/route.ts`:
    - `GET /api/admin/reports`: Lists pending reports for moderator review with pagination and contributing report details.
    - `PATCH /api/admin/reports/[id]`: Moderation action handler (`APPROVE`, `REJECT`, `MERGE`, `DISMISS`).
    - Creates immutable `AuditEvent` log for every moderation action per `SEC-06`.
    - Preserves provenance of all contributing reports during `MERGE`.
  - Implement moderation UI component `components/domain/moderation-queue.tsx`.
  - Author test suite `lib/__tests__/moderation-route.test.ts`.
- **Verification**: `npm run test:run` passes.

### Task 5: 10 Explicit Safety & Provenance Verification Tests & Gate Suite
- **Action**:
  - Author tests verifying all 10 required safety scenarios:
    1. Unverified community report is visibly labeled `Unverified Community Report`.
    2. Verified pattern is visibly labeled `Verified Pattern Signature`.
    3. Unverified report does not appear in verified-only public result stream.
    4. Verified pattern does appear in verified result stream.
    5. Increasing `reportCount` alone does not transition an item to `MODERATOR_VERIFIED`.
    6. Moderator approval changes verification state correctly.
    7. Reject/dismiss does not expose the item as verified.
    8. Merge preserves report provenance.
    9. Every moderation state change creates the expected immutable `AuditEvent`.
    10. Public APIs do not expose private reporter/moderator information.
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
