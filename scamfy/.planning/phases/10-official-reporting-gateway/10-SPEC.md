# Phase 10: Official Reporting Gateway & 1930 Route — Specification

## 1. Executive Intent & Overview
Phase 10 implements Scamfy's **Official Reporting Gateway & 1930 Route (Slice 3)**, fulfilling canonical requirements `OFF-01`, `OFF-02`, `OFF-03`, `OFF-04`, `OFF-05`, and `OFF-06`.

The platform establishes an authoritative, source-backed reporting gateway for cyber financial fraud in India. It prioritizes emergency financial intervention within the 2–4 hour "Golden Hour" via the National Cyber Crime Helpline (1930) and the Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS), provides guided suspect-reporting handoffs for extracted technical identifiers, prepares clean and factual complaint payloads with mandatory user authorization before copying or external navigation, and enables victims to record official acknowledgment reference numbers for post-incident tracking.

---

## 2. Requirement Mapping & Falsifiable Acceptance Criteria

### OFF-01: Verified Official Reporting Channels Directory
- **Scope**: Curate a structured, source-backed directory of legitimate Indian fraud reporting channels.
- **Channels Included**:
  1. **National Cyber Crime Reporting Portal & Helpline (MHA / I4C)**: `1930` / `cybercrime.gov.in` (Financial fraud, identity theft, extortion).
  2. **Chakshu — Sanchar Saathi (DoT)**: `sancharsaathi.gov.in` (Fraud calls, spam SMS, suspect WhatsApp numbers).
  3. **RBI Sachet Portal (Reserve Bank of India)**: `sachet.rbi.org.in` (Unregulated deposit schemes, unregistered digital lending apps, Ponzi traps).
  4. **SEBI SCORES (Securities and Exchange Board of India)**: `scores.sebi.gov.in` (Unauthorized investment advisors, fake stock/IPO allotment scams).
  5. **National Payments Corporation of India (NPCI) & Banking Grievance**: Bank dispute portals, Ombudsman (`cms.rbi.org.in`).
- **Acceptance Criteria**:
  - Directory is typed and backed by a single source of truth in code (`lib/official-channels.ts`).
  - Every channel entry includes official agency name, verified portal URL, helpline number (if applicable), jurisdiction description, accepted identifier types, and operating hours.
  - Zero unofficial or third-party recovery services permitted.

### OFF-02: Emergency Golden-Hour Route (1930 & CFCFRMS)
- **Scope**: Detect active financial loss occurring within the critical 2–4 hour window and trigger immediate intervention protocols.
- **Acceptance Criteria**:
  - Triage scanner and reporting gateway inspect transfer recency and loss indicators.
  - If money was transferred within 2–4 hours (or loss is marked active/ongoing), render an interruptive, high-priority **Golden-Hour Emergency Intercept Modal**.
  - Modal features direct one-tap telephone dialer (`tel:1930`), clear explanation of CFCFRMS inter-bank freeze mechanics, and immediate instructions to notify victim's bank dispute desk.
  - A persistent, high-contrast urgency banner remains pinned at the top of the reporting view.

### OFF-03: Guided Suspect-Reporting Identifier Handoffs
- **Scope**: Route specific fraud indicators to the exact government agency empowered to act upon them.
- **Routing Rules**:
  - **Phone Numbers / WhatsApp / SMS**: Routes to DoT Chakshu (`sancharsaathi.gov.in`).
  - **UPI IDs / Bank Account Numbers / UTR Ref**: Routes to 1930 / Bank Dispute / CFCFRMS.
  - **Phishing URLs / Malicious Domains**: Routes to National Cyber Crime Reporting Portal (`cybercrime.gov.in`).
  - **Unlicensed Lending Apps**: Routes to RBI Sachet (`sachet.rbi.org.in`).
  - **Stock Tips / High-Yield Investment Pools**: Routes to SEBI SCORES (`scores.sebi.gov.in`).
- **Acceptance Criteria**:
  - Selecting an extracted indicator or entering a new one automatically identifies the appropriate channel and generates an identifier-specific submission checklist.

### OFF-04: Factual Complaint Payload Builder & Explicit Authorization
- **Scope**: Compile victim statements and extracted technical indicators into a standardized, purely factual incident payload.
- **Acceptance Criteria**:
  - Complaint narrative generator formats incident details chronologically: Date/Time, Loss Amount (INR), Mode of Payment, Suspect Identifiers, Platform Used, and Summary of Events.
  - Payload strictly excludes accusatory speculation and hallucinated claims; attributes all user-provided facts cleanly.
  - **Explicit Authorization Gate**: User must review the exact compiled text, confirm accuracy via checkbox/modal confirmation, and explicitly click "Authorize & Prepare Report" before any clipboard copy or outbound link activation occurs.
  - Generates downloadable formatted complaint dossier (`.txt` / `.pdf` preview) suitable for portal attachments or physical police station submission.

### OFF-05: Deep Links & Guided Step-by-Step Submission (No Fabricated APIs)
- **Scope**: Bridge user payloads to external government portals transparently.
- **Acceptance Criteria**:
  - System strictly complies with `OOS-05` — zero reverse-engineered, unofficial, or fictional government APIs.
  - Uses verified deep links opening in new secure tabs (`rel="noopener noreferrer"`).
  - Provides a side-by-side or persistent **Hybrid Drawer Protocol**: clipboard-ready fields formatted to match official portal form fields (e.g. "Suspect Account", "Transaction ID", "Narrative"), allowing users to copy each field while filling out the official government form.

### OFF-06: Official Complaint Reference & Acknowledgment Tracking
- **Scope**: Enable victims to record their official acknowledgment numbers after submitting reports to authorities.
- **Acceptance Criteria**:
  - Form inputs to record: Official Channel/Agency, Complaint Acknowledgment Reference Number (e.g., 1930 SMS Ticket ID, Cybercrime Portal ACK), Date Lodged, Police Station / Bank Branch (optional), Current Status (`LODGED`, `UNDER_INVESTIGATION`, `FUNDS_FROZEN`, `CLOSED`), and Follow-up Notes.
  - Persisted in PostgreSQL via Prisma model (`OfficialComplaintReference`) for authenticated users, with client-side `localStorage` caching and fallback for anonymous users.
  - Reference card displays recorded numbers, quick-copy triggers, and recommended follow-up timeline reminders.

---

## 3. Explicit Prohibitions & Scope Fences
1. **Zero M2M Government API Claims**: Never pretend an automated API filing occurred. Deep link + guided copying is the sole legitimate submission bridge.
2. **Zero Recovery Guarantees**: Never promise that calling 1930 or filing a complaint guarantees return of funds or unfreezing of accounts (`OOS-02`).
3. **Zero Legal Determinations**: Never declare an accused entity legally guilty or declare the victim legally innocent (`AI-05`, `OOS-03`).
4. **Boundary Fence with Phase 11**: Phase 10 implements official gateway routing, payload formatting, and reference tracking. The full multi-case timeline dashboard, encrypted evidence blob storage, and victim support center belong to Phase 11 (`CASE-01..06`).

---

## 4. Quantitative Ambiguity Scoring
| Dimension | Minimum | Target | Score | Notes |
|:---|:---:|:---:|:---:|:---|
| **Domain & Requirements** | 0.85 | 1.00 | 0.98 | Mapped 1:1 against canonical `OFF-01` through `OFF-06`. |
| **System Architecture** | 0.85 | 1.00 | 0.96 | Hybrid drawer copier, Prisma schema, Next.js route, and API boundary defined. |
| **User Experience & Flow** | 0.85 | 1.00 | 0.95 | Golden-hour emergency modal, identifier routing, payload review, and reference tracker. |
| **Security & Privacy** | 0.90 | 1.00 | 0.98 | Data minimization, explicit authorization before copy/navigation, sanitization. |
| **Composite Ambiguity** | $\le 0.15$ | $\le 0.10$ | **0.03** | **PASSED** (Ambiguity well below 0.10 threshold). |
