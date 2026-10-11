---
phase: 10
wave: 1
requirements:
  - OFF-01
  - OFF-02
  - OFF-03
  - OFF-04
  - OFF-05
  - OFF-06
  - SEC-01
  - SEC-03
  - SEC-05
  - UX-01
  - UX-02
  - UX-03
  - UX-04
  - UX-05
---

# Phase 10: Official Reporting Gateway & 1930 Route — Execution Plan (Revised)

## 1. Plan Overview
- **Phase**: 10 — Official Reporting Gateway & 1930 Route
- **Milestone**: Milestone 3 (Slice 3 - Financial Traps & Official Gateway)
- **Requirements Covered**: `OFF-01`, `OFF-02`, `OFF-03`, `OFF-04`, `OFF-05`, `OFF-06`, `SEC-01`, `SEC-03`, `SEC-05`, `UX-01`, `UX-02`, `UX-03`, `UX-04`, `UX-05`
- **Estimated Plan Slices**: 5 Core Tasks
- **Verification Gates**: Strict TypeScript (`npm run typecheck`), ESLint (`npm run lint`), Vitest (`npx vitest run`), Next.js Production Build (`npm run build`), Python Ruff, Pytest (`python -m pytest backend/tests`).

---

## 2. Task Sequence & Deliverables

### Task 1: Context-Aware Official Channels Directory & Multi-Factor Router (`lib/official-channels.ts`, `lib/__tests__/official-channels.test.ts`)
- **Action**:
  - Implement structured TypeScript directory of verified Indian reporting authorities in `lib/official-channels.ts`:
    - National Cyber Crime Reporting Portal & 1930 (`I4C / MHA`)
    - Chakshu Sanchar Saathi (`DoT`)
    - RBI Sachet (`Reserve Bank of India`)
    - SEBI SCORES 2.0 & SEBI Market Intelligence Portal (`SEBI`)
    - Bank Internal Grievance & Reserve Bank - Integrated Ombudsman Scheme, 2026 (`RBI`)
  - Implement pure, deterministic router `resolveReportingChannel(incident: FraudIncidentContext): ChannelRoutingResult`:
    - Evaluates incident type, financial loss presence, and identifier types.
    - *Financial Loss Rule*: If financial loss or unauthorized transfer occurred, 1930 / Cybercrime Portal / Bank Fraud Desk is **always** primary, regardless of elapsed time or delivery channel.
    - *Telecom Rule*: Non-loss suspicious SMS/calls route to Chakshu; loss incidents route to 1930 first with Chakshu secondary.
    - *Securities Rule*: Distinguishes registered entity disputes (SCORES 2.0) from unregistered syndicates (Cybercrime portal 1930 primary + SEBI Market Intelligence Portal confidential regulatory tip secondary).
    - *Banking Redressal Rule*: Demarcates immediate freeze requests from formal internal bank grievance and subsequent RBI Ombudsman escalation under RB-IOS 2026 (escalation permitted when dissatisfied with the bank's reply/resolution, including whole or partial rejection, or if no reply is received within the applicable response period — guidelines timeline or 30 days, whichever is longer; subject to prior bank complaint and 90-day filing period).
    - Returns primary channel recommendation, clear plain-language rationale, and relevant alternative routes.
  - Implement comprehensive unit test suite `lib/__tests__/official-channels.test.ts`:
    - Test transfers reported at 30 minutes, 4 hours, 24 hours, and 7 days (all retain 1930 guidance).
    - Test telecom communications with and without financial loss.
    - Test registered vs unregistered investment schemes.
    - Negative controls for malformed or ambiguous identifiers.
- **Requirements Satisfied**: `OFF-01`, `OFF-03`.

### Task 2: Rapid-Response Financial Fraud Protocol & Intercept Modal (`components/domain/rapid-response-modal.tsx`, `components/__tests__/rapid-response-modal.test.tsx`)
- **Action**:
  - Implement `RapidResponseModal` with accessible Radix Dialog (`role="alertdialog"`):
    - Replaces artificial "2-4 hour golden-hour cutoff" with universal rapid-response protocol.
    - Surfaces direct click-to-dial `tel:1930` and clear guidance to contact victim bank's 24x7 fraud desk with transaction UTR numbers.
    - Prominently displays non-guarantee disclosure: Scamfy guides users to alert CFCFRMS, but cannot guarantee that funds will be frozen or recovered (`OOS-02`).
  - Implement `RapidResponseBanner`: Persistent high-contrast urgency banner for active loss flows.
  - Author component test suite `components/__tests__/rapid-response-modal.test.tsx`:
    - Verify keyboard focus trapping, Escape dismissal, `tel:1930` link target, non-guarantee disclosure presence, and accessible screen reader naming.
- **Requirements Satisfied**: `OFF-02`, `UX-02`, `UX-03`.

### Task 3: Factual Complaint Payload Builder & Explicit Authorization Gate (`lib/complaint-builder.ts`, `components/domain/complaint-payload-modal.tsx`, `lib/__tests__/complaint-builder.test.ts`)
- **Action**:
  - Implement `buildFactualComplaintPayload(params: ComplaintPayloadInput): ComplaintPayloadResult`:
    - Pure function formatting victim facts, financial details, suspect identifiers, and evidence inventory into standardized complaint narrative.
    - Strictly separates provenance: user statements, extracted identifiers, and regulatory notes are demarcated with distinct labels.
    - Zero unsupported legal conclusions, accusations, or claims of guilt.
  - Implement `ComplaintPayloadModal`:
    - Pre-submission preview panel.
    - Mandatory disclosure notice: *"Notice: Opening an official portal or copying text does NOT submit a report. You must paste or submit your complaint directly on the official portal."*
    - Separate action triggers:
      - "Copy Narrative to Clipboard" (with 2000ms checkmark feedback).
      - "Download Complaint Dossier (.txt)" (client-side text export).
      - "Open Official Portal (External)" (opens verified URL in new tab with `rel="noopener noreferrer"`).
  - Implement unit test suite `lib/__tests__/complaint-builder.test.ts`:
    - Verify narrative formatting, provenance demarcation, non-conflation of user vs automated facts, and sanitization of special characters.
- **Requirements Satisfied**: `OFF-04`, `UX-01`, `UX-04`.

### Task 4: Hybrid Submission Drawer & Verified Deep Links (`components/domain/reporting-handoff-drawer.tsx`, `components/__tests__/reporting-handoff-drawer.test.tsx`)
- **Action**:
  - Implement `ReportingHandoffDrawer`:
    - Accessible dockable side drawer that remains open while victim fills out government web forms.
    - Official agency details, operating hours, and verified deep link button.
    - Field-by-field copy triggers matching official portal form sections ("Suspect Account", "Transaction Ref", "Suspect Handle", "Narrative").
    - Tactile copy feedback with `aria-live="polite"` screen reader announcements.
    - Interactive copy progress checklist tracking which fields the user has copied.
    - Adheres strictly to `OOS-05` — zero fabricated government APIs; never exposes sensitive complaint data in URL query strings.
  - Author component test suite `components/__tests__/reporting-handoff-drawer.test.tsx`:
    - Test drawer docking, field copy triggers, keyboard navigation, and deep link security attributes.
- **Requirements Satisfied**: `OFF-04`, `OFF-05`, `OOS-05`.

### Task 5: Privacy-Safe Complaint Reference Tracker & API (`prisma/schema.prisma`, `app/api/official-references/route.ts`, `components/domain/complaint-reference-tracker.tsx`, `lib/__tests__/official-references-route.test.ts`)
- **Action**:
  - Extend `prisma/schema.prisma` with data-minimized `OfficialComplaintReference` model:
    - Stores *only* `{ agency, referenceNumber, filingDate, status, followUpDate, notes }`.
    - Strictly excludes full complaint narratives, screenshots, and financial credentials.
    - Run Prisma database migration.
  - Implement Next.js BFF route `app/api/official-references/route.ts`:
    - Validates request body with strict Zod schemas (`lib/schemas/official-references.ts`).
    - Enforces server-side authorization: `userId` strictly derived from Clerk session (`auth().userId`). Client-supplied user IDs are rejected.
    - Rate-limited and sanitized. Zero logging of complaint details or credentials.
  - Implement `ComplaintReferenceTracker` UI component:
    - Form to record 1930 SMS ticket, Cybercrime ACK, or bank dispute reference number.
    - Client-side `localStorage` fallback for anonymous users with clear disclaimer and prominent "Clear Stored Reference" deletion button.
    - Non-color-only status badges (`CheckCircle` for Frozen, `Clock` for Under Investigation, `AlertTriangle` for Lodged).
  - Integrate into `app/report/page.tsx` and author comprehensive test suite.
- **Requirements Satisfied**: `OFF-06`, `SEC-01`, `SEC-03`, `SEC-05`.

---

## 3. Plan-Checker Verification & Quality Gates
- **GSD Plan-Checker Analysis**:
  - **Traceability**: All 6 canonical requirements (`OFF-01` through `OFF-06`) directly covered across Tasks 1–5.
  - **Review Corrections Satisfied**:
    - Correction A: Rapid response protocol with zero time cutoffs and clear non-guarantees.
    - Correction B: Context-aware multi-channel routing based on financial loss, not single identifier triggers.
    - Correction C: Re-verified banking grievance architecture distinguishing immediate freeze, cybercrime portal, bank grievance, and RBI Ombudsman.
    - Correction D: Data-minimized persistence excluding narratives from `localStorage`, with clear deletion action and server session authorization.
    - Correction E: Strict separation between drafting, previewing, downloading, copying, opening links, and submitting.
  - **Quality Gates**: All 6 canonical gates verified at every task.
