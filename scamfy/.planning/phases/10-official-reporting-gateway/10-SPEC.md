# Phase 10: Official Reporting Gateway & 1930 Route — Specification (Revised)

## 1. Executive Intent & Overview
Phase 10 implements Scamfy's **Official Reporting Gateway & 1930 Route (Slice 3)**, fulfilling canonical requirements `OFF-01`, `OFF-02`, `OFF-03`, `OFF-04`, `OFF-05`, and `OFF-06`.

The platform establishes an authoritative, source-backed reporting gateway for cyber financial fraud in India. It provides rapid-response guidance prioritizing the National Cyber Crime Helpline (1930) and the Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS) alongside bank fraud notification whenever unauthorized financial transactions or fraud are reported—without presenting arbitrary cutoffs or guarantees.

The gateway provides context-aware official routing based on incident type and financial loss rather than superficial identifier syntax, prepares clean and factual complaint payloads distinguishing user facts from automated signals, enforces explicit user authorization, provides deep links and field copy helpers under the Hybrid Drawer Protocol, and enables victims to record official acknowledgment numbers with minimal, privacy-safe metadata.

---

## 2. Requirement Mapping & Falsifiable Acceptance Criteria

### OFF-01: Verified Official Reporting Channels Directory
- **Scope**: Curate a structured, source-backed directory of legitimate Indian fraud reporting channels with explicit jurisdictions, capabilities, and procedural limitations.
- **Channels Included**:
  1. **National Cyber Crime Reporting Portal & 1930 Helpline (I4C / MHA)**: Primary route for all cyber financial fraud, unauthorized online debits, extortion, impersonation, and identity theft.
  2. **Chakshu — Sanchar Saathi (DoT)**: Reporting suspected telecom fraud communications (calls, SMS, WhatsApp) for telecom intelligence and carrier blocking. *Explicit limitation*: Does not handle bank fund recovery or legal FIRs; incidents involving transferred money are always routed to 1930 / bank fraud desk.
  3. **RBI Sachet Portal (Reserve Bank of India)**: Intelligence gathering on unauthorized deposit-taking, unregistered Digital Lending Apps (DLAs), and illegal collective investment schemes.
  4. **SEBI SCORES 2.0 & Market Intelligence Portal (SEBI)**: Investor grievance redressal against listed companies and SEBI-registered intermediaries via SCORES 2.0 (`scores.sebi.gov.in`); distinct confidential tip submission for unregistered investment advisors, pump-and-dump syndicates, and fake IPOs via the SEBI Market Intelligence Portal (`miportal.sebi.gov.in`).
  5. **Bank Internal Grievance Desk & Reserve Bank - Integrated Ombudsman Scheme, 2026**: Guidance on lodging initial bank disputes, requesting transaction UTR debit holds, and subsequent escalation to the RBI Ombudsman under RB-IOS 2026 (`cms.rbi.org.in`) when dissatisfied with the bank's reply or resolution (including whole or partial rejection) or upon receiving no reply within the applicable response period (guidelines timeline or 30 days, whichever is longer), subject to the prior-bank-complaint prerequisite and 90-day filing limitation period.
- **Acceptance Criteria**:
  - Directory is typed and backed by a single source of truth (`lib/official-channels.ts`).
  - Every channel entry documents governing agency, verified URL, telephone helpline (if applicable), precise scope, accepted identifier types, and operating hours.
  - Zero unofficial or private "fund recovery" services permitted.

### OFF-02: Rapid-Response Financial Fraud Protocol (1930 & CFCFRMS)
- **Scope**: Prompt intervention guidance for unauthorized transactions and active cyber financial loss.
- **Revised Rules (Addressing Review Correction A)**:
  - **No Artificial Cutoff**: 1930 reporting guidance and bank notification instructions must remain fully accessible and recommended whenever financial loss or unauthorized transfers are reported, whether the transaction occurred 30 minutes ago, 4 hours ago, or several days ago.
  - **Recency Increases Urgency, Never Eligibility**: While a recent transfer (e.g. within 2–4 hours) indicates higher likelihood of successful CFCFRMS inter-bank holds before scammers withdraw cash, elapsed time never disables or hides the route.
  - **Non-Guarantee Disclosure**: Scamfy explicitly clarifies that calling 1930 and notifying the bank initiates inter-bank alerts via CFCFRMS, but Scamfy cannot guarantee that funds will be frozen, preserved, or recovered (`OOS-02`).
  - **Rapid-Response Modal & Pinned Urgency Banner**:
    - Triggered on triage results indicating unauthorized financial debits or money-transfer pressure.
    - Features direct one-tap dialer (`tel:1930`), clear guidance to notify the victim bank's 24x7 fraud desk with transaction UTR numbers, and advice to request an immediate debit freeze.

### OFF-03: Context-Aware Incident & Identifier Routing
- **Scope**: Route fraud incidents based on incident type, presence of financial loss, and specific technical indicators rather than relying solely on identifier format.
- **Revised Routing Rules (Addressing Review Correction B)**:
  - **Financial Loss / Unauthorized Transaction Present**:
    - *Primary Route*: 1930 Helpline, National Cyber Crime Reporting Portal (`cybercrime.gov.in`), and victim's bank 24x7 fraud desk.
    - *Secondary Context*: If a phone number or SMS header was the delivery vector, provide DoT Chakshu as a secondary carrier-blocking option *after* financial fraud reporting.
  - **Suspicious Telecom Communications Without Financial Loss**:
    - *Primary Route*: DoT Chakshu (`sancharsaathi.gov.in`).
    - *Secondary Context*: Cybercrime portal if extortion, blackmail, or digital arrest threats are present.
  - **Unregulated Lending Offers / Excessive Upfront Deductions**:
    - *Primary Route*: RBI Sachet (`sachet.rbi.org.in`) and partnering Regulated Entity NBFC verification.
    - *Secondary Context*: 1930 / Cybercrime portal if blackmail, photo extortion, or advance fee payments occurred.
  - **Securities / Investment Traps**:
    - Distinguish registered intermediary disputes (SEBI SCORES 2.0, `scores.sebi.gov.in`) from suspected unregistered tipsters / VIP WhatsApp/Telegram stock syndicates / Ponzi schemes (National Cyber Crime Reporting Portal 1930 as primary financial fraud route, accompanied by secondary confidential regulatory tip submission on SEBI Market Intelligence Portal, `miportal.sebi.gov.in`).
  - **Phishing Domains / Social Media Impersonation**:
    - Cybercrime portal cyber fraud reporting with domain takedown documentation.
- **Acceptance Criteria**:
  - Routing engine (`resolveReportingChannel`) is pure, deterministic, and returns primary recommendation, rationale explanation, and applicable secondary routes.

### OFF-04: Factual Complaint Payload Builder & Explicit Authorization Gate
- **Scope**: Compile victim statements and extracted technical indicators into a standardized, purely factual incident payload with strict separation of actions.
- **Revised Controls (Addressing Review Correction E)**:
  - **Separation of Workflow Steps**:
    1. *Draft Preparation*: Automatically populates structured fields from scan results (Date/Time, Loss Amount INR, Payment Mode, Suspect Identifiers, Platform Used).
    2. *Preview Panel*: User inspects the exact compiled factual narrative. Provenance is cleanly marked: user statements vs. extracted indicators vs. automated signals. Zero unsupported legal accusations or claims of guilt.
    3. *Document Export*: User can download the narrative dossier (`.txt` / formatted `.pdf` preview) for physical submission or portal attachment. Downloading does not constitute filing a report.
    4. *Clipboard Copying*: User can copy individual fields or full text. Copying does not constitute filing a report.
    5. *Official Portal Navigation*: Clicking outbound links opens the government portal in a new tab (`rel="noopener noreferrer"`). Opening a link is never presented or recorded as a submitted report.
    6. *Explicit Transmission Authorization*: If an authenticated external submission mechanism is supported in the future, explicit informed consent is required immediately before transmission. In Phase 10, all submissions occur via user action on the official portal.

### OFF-05: Deep Links & Hybrid Drawer Protocol (No Fabricated APIs)
- **Scope**: Assist victims during submission on external portals without fabricating APIs.
- **Acceptance Criteria**:
  - Full adherence to `OOS-05` — zero reverse-engineered or fictional government APIs.
  - Outbound links use verified official URLs with `rel="noopener noreferrer"`. Sensitive complaint details are never embedded in URL parameters.
  - Persistent **Hybrid Drawer Protocol** (`ReportingHandoffDrawer`): Dockable side helper displaying verified official instructions, deep link button, field-by-field copy triggers matching official portal form sections, and a visual progress checklist tracking which fields the user has copied.

### OFF-06: Privacy-Safe Complaint Reference Tracking
- **Scope**: Enable victims to record official complaint reference numbers for post-incident tracking with strict data minimization.
- **Revised Controls (Addressing Review Correction D)**:
  - **Data Minimization**: Persist *only* the minimum metadata necessary for follow-up:
    - Agency identifier (`CYBERCRIME_1930`, `CHAKSHU_DOT`, `RBI_SACHET`, `SEBI_SCORES`, `SEBI_MI_PORTAL`, `BANK_GRIEVANCE`)
    - Reference Number (validated format, e.g. 1930 SMS ticket ID, Cybercrime ACK, Bank dispute reference)
    - Filing Date, Status (`LODGED`, `UNDER_INVESTIGATION`, `FUNDS_FROZEN`, `CLOSED`), and optional follow-up reminder note (sanitized, max 500 chars, warning against credentials/PII).
  - **Strict Local Storage Boundary**: Anonymous users cache references in browser `localStorage`. Full complaint narratives, screenshots, transaction details, and credentials are **strictly prohibited** from `localStorage`.
  - **Clear Deletion**: Provide a prominent "Clear Stored Reference" button to completely purge locally cached records.
  - **Server-Side Ownership**: For authenticated users via Prisma (`OfficialComplaintReference`), derive `userId` strictly from the server-authenticated session. Client-supplied user IDs are rejected.
  - **Zero Sensitive Logging**: Exclude full complaint narratives, bank account numbers, and credentials from application logs and analytics events.

---

## 3. Explicit Prohibitions & Scope Fences
1. **Zero Cutoff Rules**: Never disable 1930 or bank reporting because a transfer is older than 2 or 4 hours.
2. **Zero M2M Government API Claims**: Never claim or imply that opening a portal or copying text submitted a formal report.
3. **Zero Recovery Guarantees**: Never promise that reporting guarantees fund recovery or account unfreezing (`OOS-02`).
4. **Zero Legal Determinations**: Never declare an accused entity legally guilty or declare the victim legally innocent (`AI-05`, `OOS-03`).
5. **Boundary Fence with Phase 11**: Phase 10 delivers gateway routing, payload formatting, and reference tracking. Full multi-case management, encrypted object storage for evidence files, and timeline editors belong to Phase 11 (`CASE-01..06`).

---

## 4. Qualitative Planning-Readiness Review

Planning readiness for Phase 10 is assessed through demonstrable architectural and regulatory invariants:

1. **Requirement Mapping**: Every canonical requirement (`OFF-01` through `OFF-06`) maps directly to falsifiable acceptance criteria in this specification and to a specific execution task in `10-PLAN.md`.
2. **Authoritative Source Grounding**: All applicable regulatory and official reporting claims cite verified primary sources (MHA/I4C 1930, DoT Sanchar Saathi, RBI Sachet, SEBI SCORES 2.0, SEBI Market Intelligence Portal, RB-IOS 2026, and RBI Circular 2017-18/15) along with their specific procedural limitations and exclusions.
3. **Safety & Privacy Boundaries**: Strict boundaries are established: zero fabricated government APIs (`OOS-05`), complete separation between drafting/copying/linking actions and submission authorization, zero fund recovery guarantees (`OOS-02`), and complete exclusion of complaint narratives, credentials, and evidence files from `localStorage`.
4. **Structural Verification**: GSD Core planning validators (`ui-plan-gate`, `ui-safety-gate`, and `validate consistency`) pass cleanly with all frontmatter requirements satisfied.
5. **Recorded Implementation & Deployment Risks**: Outstanding technical risks (such as Prisma schema migration in production environments and cross-platform desktop telephony protocol fallback) are explicitly tracked in planning records rather than prematurely treated as resolved.
