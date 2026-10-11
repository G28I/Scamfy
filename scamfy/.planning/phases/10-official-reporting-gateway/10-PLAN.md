# Phase 10: Official Reporting Gateway & 1930 Route — Execution Plan

## 1. Plan Overview
- **Phase**: 10 — Official Reporting Gateway & 1930 Route
- **Milestone**: Milestone 3 (Slice 3 - Financial Traps & Official Gateway)
- **Requirements Covered**: `OFF-01`, `OFF-02`, `OFF-03`, `OFF-04`, `OFF-05`, `OFF-06`, `SEC-01`, `SEC-03`, `SEC-05`, `UX-01`, `UX-02`, `UX-03`, `UX-04`, `UX-05`
- **Estimated Plan Slices**: 5 Core Tasks
- **Verification Gates**: TypeScript (`npm run typecheck`), ESLint (`npm run lint`), Vitest (`npx vitest run`), Next.js Production Build (`npm run build`), Python Ruff, Pytest (`python -m pytest backend/tests`).

---

## 2. Task Sequence & Deliverables

### Task 1: Authoritative Official Channels Directory & Identifier Router (`lib/official-channels.ts`, `lib/__tests__/official-channels.test.ts`)
- **Action**:
  - Implement pure TypeScript definitions and constants for verified Indian fraud reporting authorities:
    - National Cyber Crime Reporting Portal & 1930 (`I4C / MHA`)
    - Chakshu Sanchar Saathi (`DoT`)
    - RBI Sachet (`Reserve Bank of India`)
    - SEBI SCORES 2.0 (`SEBI`)
    - Banking Ombudsman & NPCI Grievance (`RBI / NPCI`)
  - Implement `resolveReportingChannel(identifiers: SuspectIdentifier[]): ReportingChannelRecommendation`:
    - Pure, deterministic routing matching phone/WhatsApp to Chakshu, UPI/bank to 1930/CFCFRMS, domains to Cybercrime Portal, unregistered loans to Sachet, investment traps to SEBI SCORES.
  - Implement unit test suite `lib/__tests__/official-channels.test.ts`:
    - Test channel resolution across all supported identifier types with negative controls for ambiguous inputs.
- **Requirements Satisfied**: `OFF-01`, `OFF-03`.

### Task 2: Golden-Hour Emergency Protocol & Intercept Modal (`components/domain/golden-hour-modal.tsx`, `components/__tests__/golden-hour-modal.test.tsx`)
- **Action**:
  - Implement `GoldenHourModal` with accessible Radix Dialog (`role="alertdialog"`).
  - Prominently render direct one-touch dialer `tel:1930` and CFCFRMS inter-bank freeze step instructions.
  - Implement `GoldenHourBanner`: Sticky top urgency banner for recent ($\le 2-4$ hours) or active loss situations.
  - Author unit tests `components/__tests__/golden-hour-modal.test.tsx`:
    - Verify keyboard focus trap, escape handling, `tel:1930` link target, and dismissal state.
- **Requirements Satisfied**: `OFF-02`, `UX-02`, `UX-03`.

### Task 3: Factual Complaint Payload Builder & Explicit Authorization Gate (`lib/complaint-builder.ts`, `components/domain/complaint-payload-modal.tsx`, `lib/__tests__/complaint-builder.test.ts`)
- **Action**:
  - Implement `buildFactualComplaintPayload(params: ComplaintPayloadInput): ComplaintPayloadResult`:
    - Pure function assembling chronological incident facts, financial figures, suspect identifiers, and evidence inventory into standardized complaint narrative.
    - Zero hallucinated accusations; objective phrasing.
  - Implement `ComplaintPayloadModal` featuring:
    - Pre-submission review screen.
    - Mandatory checkbox confirmation: *"I confirm that this narrative contains truthful, factual information based on my personal experience..."*
    - Explicit authorization buttons: "Authorize & Open Portal", "Download Complaint Dossier (.txt)", "Copy Narrative".
  - Implement unit tests for complaint builder and modal.
- **Requirements Satisfied**: `OFF-04`, `UX-01`, `UX-04`.

### Task 4: Hybrid Submission Drawer & Deep Links (`components/domain/reporting-handoff-drawer.tsx`, `components/__tests__/reporting-handoff-drawer.test.tsx`)
- **Action**:
  - Implement `ReportingHandoffDrawer`:
    - Dockable side drawer displaying official agency details, verified deep link (`target="_blank" rel="noopener noreferrer"`), and field-by-field clipboard copy helpers.
    - Copy status feedback with accessible `aria-live` announcements.
    - Field checklist allowing victims to tick off each field as they paste it into the official portal.
    - Downloadable incident narrative dossier button.
  - Author component test suite validating copy triggers, drawer controls, and zero fake API claims.
- **Requirements Satisfied**: `OFF-04`, `OFF-05`, `OOS-05`.

### Task 5: Official Reference Tracker with Prisma Model & API (`prisma/schema.prisma`, `app/api/official-references/route.ts`, `components/domain/complaint-reference-tracker.tsx`, `lib/__tests__/official-references-route.test.ts`)
- **Action**:
  - Extend `prisma/schema.prisma` with `OfficialComplaintReference` model and run migration.
  - Implement Next.js BFF route `app/api/official-references/route.ts`:
    - `POST`: Validates and saves acknowledgment reference (Zod schema validation, auth user or anonymous session, rate limiting).
    - `GET`: Retrieves user's recorded references.
  - Implement `ComplaintReferenceTracker` UI component:
    - Form to record 1930 ticket number, Cybercrime Portal ACK, date lodged, and current status.
    - Status badges, copy helper, and follow-up guidance.
    - Automatic `localStorage` sync for anonymous users.
  - Integrate into `/report` page and add comprehensive test suite.
- **Requirements Satisfied**: `OFF-06`, `SEC-01`, `SEC-05`.

---

## 3. Plan-Checker Verification & Quality Gates
- **GSD Plan-Checker Analysis**:
  - **Traceability**: All 6 canonical requirements (`OFF-01` through `OFF-06`) directly covered across Tasks 1–5.
  - **Scope Enforcement**: Zero machine-to-machine APIs fabricated (`OOS-05`), zero recovery guarantees (`OOS-02`), zero legal guilt determinations (`AI-05`, `OOS-03`).
  - **Security & Privacy**: Client and server validation with Zod, rate limiting, data minimization, sanitized errors.
  - **Quality Gates**: All 6 canonical gates verified at every task.
