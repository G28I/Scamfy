# Phase 10: Official Reporting Gateway & 1930 Route — Context & Decisions (Revised)

## 1. Executive Context & Review Reconciliations

This document captures the corrected architectural, product, and legal decisions for Phase 10 (Slice 3 — Official Reporting Gateway & 1930 Route). It reconciles initial proposals with the five mandatory review corrections to ensure legal accuracy, privacy preservation, and strict non-guarantee boundaries.

---

## 2. Locked Architectural & Product Decisions

### Decision 1: Rapid-Response Financial Fraud Protocol (Replacing Fixed 2–4 Hour Cutoffs)
- **Review Finding Addressed**: Correction A.
- **Context**: The previous draft described an emergency route contingent on money having moved within 2–4 hours, inadvertently implying a cutoff or a guaranteed intervention window.
- **Decision**:
  1. **Universal Access**: 1930 and bank fraud desk notification guidance remains permanently accessible and recommended whenever financial loss or unauthorized transactions are reported, regardless of elapsed time (whether 30 minutes, 6 hours, or several days ago).
  2. **Recency Context**: A recent transfer increases urgency because bank holds are more effective before fraudsters move funds through cash-out chains, but elapsed time never disables the 1930 route or guidance.
  3. **Terminology**: Use *"Rapid-Response Financial Fraud Protocol"* or *"Urgent Reporting"* instead of claiming a guaranteed "Golden-Hour" intervention window.
  4. **Non-Guarantee Disclosure**: Clearly state that calling 1930 and notifying the bank triggers CFCFRMS inter-bank alerts to attempt debit holds, but Scamfy cannot guarantee that funds will be frozen, preserved, or recovered (`OOS-02`).

### Decision 2: Multi-Factor Context-Aware Incident Routing (Replacing Single-Identifier Rules)
- **Review Finding Addressed**: Correction B.
- **Context**: An identifier (e.g., a phone number, UPI ID, or domain) alone must not dictate a single reporting agency. Financial loss changes the primary route entirely.
- **Decision**:
  1. **Primary Routing Priority**:
     - *If money was transferred or unauthorized financial transaction occurred*: Primary route is ALWAYS 1930, National Cyber Crime Reporting Portal (`cybercrime.gov.in`), and victim bank's 24x7 fraud desk—even if the initial contact was via SMS or phone.
     - *If suspicious telecom communication (call, SMS, WhatsApp) occurred without financial loss*: Primary route is DoT Chakshu (`sancharsaathi.gov.in`) for telecom-level spam/fraud number carrier investigation.
     - *If unregulated deposit scheme, unlicensed loan app, or Ponzi offer*: Primary route is RBI Sachet (`sachet.rbi.org.in`), with Cybercrime Portal / 1930 secondary if advance-fee fraud or extortion occurred.
     - *If investment / stock market fraud*:
       - If complaint is against a SEBI-registered entity / listed company: SEBI SCORES 2.0 (`scores.sebi.gov.in`).
       - If suspected unregistered advisor, fake IPO group, or VIP Telegram syndicate: SEBI Unregistered Entity alert mechanism and Cybercrime Portal.
     - *If phishing domain / impersonation*: Cybercrime Portal.
  2. **Deterministic Explanation**: Every routing recommendation returns a clear explanation of *why* the channel is suggested and lists relevant alternative/secondary channels.

### Decision 3: 4-Tier Banking Redressal Architecture (Clarifying RBI Ombudsman & Circulars)
- **Review Finding Addressed**: Correction C.
- **Context**: Previous drafts cited RBI circular `RBI/2017-18/15` (three working days) as if it were a universal reporting deadline.
- **Decision**:
  1. Clearly document that *RBI/2017-18/15* governs **customer liability limitation for unauthorized electronic banking transactions** (zero customer liability applies where fraud is due to bank negligence or third-party breach without customer fault, reported within three working days). It is not a deadline for filing a police complaint or reporting to 1930.
  2. Keep four distinct operational phases clearly demarcated in code and UI:
     - **Stage 1 (Immediate Fraud Reporting)**: Call 1930 and bank 24x7 helpline immediately to request an urgent debit freeze / lien.
     - **Stage 2 (Formal Cybercrime Report)**: File official complaint on `cybercrime.gov.in` within 24 hours to obtain formal acknowledgment.
     - **Stage 3 (Bank Internal Grievance Redressal)**: Submit formal written dispute to bank branch / Principal Nodal Officer citing transaction UTR and 1930 acknowledgment.
     - **Stage 4 (RBI Ombudsman Escalation)**: Under the RBI Integrated Ombudsman Scheme, escalate to the Ombudsman (`cms.rbi.org.in`) only if the bank rejects the grievance, fails to respond within 30 days, or offers an unsatisfactory resolution.

### Decision 4: Strict Data-Minimization in Local Storage & Server Authorization
- **Review Finding Addressed**: Correction D.
- **Context**: Storing full narratives or sensitive transaction data in browser `localStorage` creates client-side leakage risks on shared/college computers.
- **Decision**:
  1. **Strict Metadata Only**:
     - `localStorage` for anonymous users stores *only*: `{ agency, referenceNumber, filingDate, status, followUpDate, notes }`.
     - Full complaint narratives, screenshots, transaction amounts, bank account numbers, credentials, and evidence files are **strictly excluded** from local storage.
  2. **Clear Deletion**: Include a prominent "Delete Stored Reference" action that immediately purges local storage items.
  3. **Privacy Disclaimer**: Clear advisory explaining that anonymous records reside in the current browser and will be cleared if browser cookies/storage are deleted.
  4. **Server Authorization**: For authenticated users via Prisma (`OfficialComplaintReference`), `userId` is strictly derived from the verified Clerk server session (`auth().userId`). Client-supplied user IDs in request bodies are ignored/rejected.
  5. **Zero Sensitive Logging**: Backend and BFF routes exclude complaint details, reference numbers, and financial identifiers from application logs and PostHog analytics.

### Decision 5: Complete Separation of Review, Copy, Link, and Authorization Actions
- **Review Finding Addressed**: Correction E.
- **Context**: Opening a link or copying text must never be conflated with submitting a complaint.
- **Decision**:
  1. **Distinct Stages in Code & UI**:
     - *Drafting*: Structuring user-entered and scan-extracted facts.
     - *Previewing*: Monospace / card preview with explicit provenance markers (user facts vs. extracted entities vs. rule signals).
     - *Copying*: Explicit button "Copy Field" / "Copy All" with temporary "Copied to clipboard" feedback.
     - *Downloading*: "Download Complaint Dossier (.txt)" generating client-side text file.
     - *Opening External Portal*: Outbound link opens government portal in new tab (`rel="noopener noreferrer"`).
  2. **Explicit Clarification**: Prominent disclaimer on all preview and copy screens: *"Opening an official portal or copying text does NOT submit a complaint. You must complete and submit your report directly on the government portal."*
  3. **Zero Fabricated APIs**: Scamfy adheres strictly to `OOS-05`. No claims of automated background submission are ever made.
