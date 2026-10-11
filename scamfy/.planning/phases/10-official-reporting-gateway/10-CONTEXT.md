# Phase 10: Official Reporting Gateway & 1930 Route — Context & Decisions

## 1. Executive Decisions & Architectural Rationale

This document locks the implementation and architectural decisions captured during `/gsd-discuss-phase 10` for downstream research, UI specifications, and execution planning.

---

## 2. Locked Implementation Decisions

### Decision 1: Hybrid Drawer Protocol + Downloadable Dossier
- **Context**: Government agencies in India (cybercrime.gov.in, Chakshu/DoT, RBI Sachet, SEBI SCORES) do not provide public authenticated citizen submission REST APIs for third-party platforms.
- **Decision**: Scamfy implements a **Hybrid Drawer Protocol**:
  1. A floating, persistent right-hand drawer / side overlay (`ReportingHandoffDrawer`) remains visible and sticky when the user opens the official portal in a new tab.
  2. The drawer provides field-by-field clipboard copy triggers matching the exact field layout of official portal forms (e.g., "Suspect Account / UPI", "Suspect Mobile / Handle", "Transaction ID / UTR", "Incident Date & Time", "Factual Summary").
  3. Provides an integrated checklist tracking which fields the user has copied.
  4. Scamfy also generates a standardized, downloadable incident dossier (`.txt` / formatted `.pdf` export) titled `"Cybercrime Complaint Narrative & Evidence Digest"`. Victims can attach this directly to the official portal's file upload field or print it for in-person police station reporting.

### Decision 2: Database-Backed Reference Tracker with Local Storage Fallback
- **Context**: Per `OFF-06`, users need to record official acknowledgment reference numbers (1930 SMS ticket ID, Cybercrime Portal ACK, Bank dispute reference number, Police GD/FIR number) to track case progress without waiting for Phase 11.
- **Decision**:
  1. Add a Prisma relational model `OfficialComplaintReference`:
     - `id`: String (UUID)
     - `userId`: String (Clerk user ID, nullable)
     - `anonymousSessionId`: String (nullable, for session-linked anonymous tracking)
     - `agency`: String (`CYBERCRIME_1930`, `CHAKSHU_DOT`, `RBI_SACHET`, `SEBI_SCORES`, `BANK_GRIEVANCE`)
     - `referenceNumber`: String (trimmed, validated format)
     - `incidentDate`: DateTime (optional)
     - `filingDate`: DateTime (default `now()`)
     - `status`: String (`LODGED`, `UNDER_INVESTIGATION`, `FUNDS_FROZEN`, `CLOSED`)
     - `policeStation`: String (optional)
     - `notes`: String (optional)
     - `createdAt`, `updatedAt`: DateTime
  2. Authenticated users persist their records directly to PostgreSQL via `/api/official-references`.
  3. Anonymous users automatically cache references in browser `localStorage`, with an option to sync to their account upon sign-in.

### Decision 3: Immediate Golden-Hour Emergency Intercept Modal + Top Urgency Banner
- **Context**: The National Cyber Crime Reporting Portal and Indian police emphasize the "Golden Hour" (first 2–4 hours after transfer) during which the 1930 helpline can initiate an immediate inter-bank freeze via CFCFRMS before scammers siphon funds.
- **Decision**:
  1. If a triage scan or gateway intake indicates a transfer within 2–4 hours (or an active ongoing fraud scenario), display an immediate interruptive **Golden-Hour Emergency Intercept Modal** (`GoldenHourModal`).
  2. The modal prominently surfaces:
     - Direct one-tap dialer button: `tel:1930`
     - Concise 3-step urgent protocol: (a) Call 1930 immediately, (b) Notify payer bank's fraud desk to flag transaction UTR, (c) Preserve transaction SMS / debit advice.
  3. A persistent, high-contrast red emergency banner remains pinned at the top of the reporting view throughout the session.

---

## 3. Scope Boundaries & Phase 11 Separation
- **Phase 10 Deliverables**:
  - Authoritative directory of official reporting channels.
  - Emergency 1930 & golden-hour routing logic and modal dialog.
  - Guided identifier-based suspect reporting handoff.
  - Factual complaint narrative generator with mandatory explicit authorization gate.
  - Hybrid drawer with copy-paste helpers and downloadable incident dossier.
  - Official complaint acknowledgment reference tracker with database persistence and local fallback.
- **Phase 11 Fences (`CASE-01..06`)**:
  - Full victim case center with multi-case management dashboard.
  - Encrypted object storage (Cloudflare R2 / S3) for raw screenshots, chats, and audio recordings.
  - Interactive multi-party chronological timeline editor.
  - AI-assisted evidence timeline generation.
