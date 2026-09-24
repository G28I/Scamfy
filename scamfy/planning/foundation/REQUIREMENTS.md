# Scamfy — Requirements Baseline

These requirements are intentionally numbered so they can be traced to GSD phases, implementation tasks, tests, and verification records.

## V1 Functional Requirements

### Detection and analysis

- [ ] **DET-01** — The system shall accept suspicious text as input for analysis.
- [ ] **DET-02** — The system shall identify one or more scam categories when supported by available evidence.
- [ ] **DET-03** — The system shall extract relevant entities such as URLs, phone numbers, UPI IDs, email addresses, monetary values, dates, company names, and payment instructions when present.
- [ ] **DET-04** — The system shall display the concrete signals that contributed to a risk assessment.
- [ ] **DET-05** — The system shall distinguish uncertainty and incomplete evidence instead of presenting an unsupported conclusion as fact.

### Rule engine and AI

- [ ] **AI-01** — Deterministic scam rules shall execute independently of the LLM.
- [ ] **AI-02** — NVIDIA Nemotron shall be accessed through the NVIDIA API/NIM layer rather than directly from the browser.
- [ ] **AI-03** — LLM output shall be validated against typed backend schemas before use by downstream features.
- [ ] **AI-04** — The application shall preserve enough metadata to identify which model configuration produced an analysis.
- [ ] **AI-05** — An LLM result shall not by itself constitute a legal or criminal determination.

### Money-mule protection

- [ ] **MULE-01** — The system shall detect patterns where a person is asked to receive funds into a personal account and forward those funds elsewhere.
- [ ] **MULE-02** — High-risk money-mule patterns shall trigger a dedicated warning and immediate safe-action guidance.
- [ ] **MULE-03** — The user shall be able to preserve the relevant message and transaction evidence for a case.

### Loan and financial traps

- [ ] **LOAN-01** — The system shall calculate transparent relationships between stated loan amount, actual disbursement, repayment amount, fees, and duration when those fields are provided.
- [ ] **LOAN-02** — The system shall clearly distinguish calculated facts from model-generated interpretations.
- [ ] **LOAN-03** — Where lender identity is provided, the system shall support an authoritative verification workflow when an appropriate source is available.

### Community intelligence

- [ ] **REP-01** — Authenticated users shall be able to report suspicious identifiers or campaigns.
- [ ] **REP-02** — Reports shall preserve provenance and timestamp information.
- [ ] **REP-03** — Duplicate and substantially overlapping reports shall be mergeable without losing provenance.
- [ ] **REP-04** — Public-facing pattern information shall distinguish user reports from official or verified information.
- [ ] **REP-05** — Moderators shall be able to review, merge, suppress, or correct reports.

### Official reporting

- [ ] **OFF-01** — Scamfy shall maintain a source-backed routing table for official reporting destinations.
- [ ] **OFF-02** — Scamfy shall provide the current official Indian cyber-financial-fraud reporting route, including 1930 and the National Cyber Crime Reporting Portal, when applicable.
- [ ] **OFF-03** — Scamfy shall support an official suspect-reporting handoff for supported identifier types when applicable.
- [ ] **OFF-04** — Before any supported external submission, the user shall see the information intended to be transmitted and explicitly authorize it.
- [ ] **OFF-05** — If no verified machine-to-machine official integration exists, Scamfy shall use a deep link and guided submission rather than fabricating an API integration.
- [ ] **OFF-06** — The case shall be able to store an official complaint/reference number supplied by the user.

### Victim case management

- [ ] **CASE-01** — Authenticated users shall be able to create an incident case.
- [ ] **CASE-02** — A case shall support a chronological timeline.
- [ ] **CASE-03** — A case shall store transaction/reference details and suspicious identifiers.
- [ ] **CASE-04** — A case shall support private evidence metadata and uploads.
- [ ] **CASE-05** — Scamfy shall generate a factual incident summary from case data without inventing facts.
- [ ] **CASE-06** — Case access shall be authorization-controlled.

### Privacy and security

- [ ] **SEC-01** — Basic scam checking shall not require account creation.
- [ ] **SEC-02** — Secrets and provider credentials shall remain server-side.
- [ ] **SEC-03** — Raw provider exceptions shall not be exposed to users.
- [ ] **SEC-04** — Sensitive evidence shall not be emitted into analytics events or ordinary application logs.
- [ ] **SEC-05** — Sensitive endpoints shall have rate limiting and abuse controls.
- [ ] **SEC-06** — Moderator actions and sensitive case changes shall be auditable.
- [ ] **SEC-07** — Evidence access shall require explicit authorization and least-privilege permissions.

### UX and accessibility

- [ ] **UX-01** — Every high-risk result shall explain the risk and the immediate recommended action.
- [ ] **UX-02** — Emergency financial-fraud guidance shall be prominent rather than buried.
- [ ] **UX-03** — Core workflows shall be keyboard accessible.
- [ ] **UX-04** — Focus states and contrast shall meet the project's accessibility baseline.
- [ ] **UX-05** — Loading, success, and error states shall be understandable without exposing internal details.

### Engineering quality

- [ ] **ENG-01** — Rule-engine behavior shall have unit tests.
- [ ] **ENG-02** — AI response schemas shall have contract tests.
- [ ] **ENG-03** — Critical end-to-end workflows shall have Playwright coverage.
- [ ] **ENG-04** — Each completed phase shall include documented verification evidence.
- [ ] **ENG-05** — Every consequential architecture decision shall be recorded in the planning history.

## V2 / Later Requirements

- [ ] **V2-01** — OCR-based extraction from receipts and screenshots.
- [ ] **V2-02** — Multilingual analysis for major Indian languages.
- [ ] **V2-03** — College-specific dashboards and alerting.
- [ ] **V2-04** — Advanced clustering of related scam campaigns.
- [ ] **V2-05** — Verified official API integrations where governments or institutions publish supported interfaces.
- [ ] **V2-06** — Native mobile client.

## Explicitly Out of Scope

- **OOS-01** — Direct control of a user's bank account or payment account.
- **OOS-02** — Automated fund movement, reversal, or recovery.
- **OOS-03** — Automated legal guilt/innocence determinations.
- **OOS-04** — Public doxxing or unverified criminal accusations.
- **OOS-05** — Unofficial or reverse-engineered government submission APIs.
- **OOS-06** — A general-purpose social network before the safety core is proven.
