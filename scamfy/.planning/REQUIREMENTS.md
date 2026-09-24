# Scamfy — Requirements Baseline & Traceability Matrix

This document defines the canonical requirement IDs for Scamfy v1, mapped directly to product phases and verification gates.

---

## 1. Functional Requirements (V1)

### Detection & Analysis (DET)
- [ ] **DET-01** — The system shall accept suspicious text (messages, emails, job postings, payment requests) as input for analysis.
- [ ] **DET-02** — The system shall identify one or more primary and secondary scam categories supported by available evidence.
- [ ] **DET-03** — The system shall extract structured entities: URLs, phone numbers, UPI IDs, bank accounts, email addresses, monetary figures, dates, company names, and payment instructions.
- [ ] **DET-04** — The system shall display concrete, understandable signals contributing to the overall risk assessment.
- [ ] **DET-05** — The system shall explicitly distinguish uncertainty and missing evidence rather than asserting unsupported conclusions as facts.

### Rule Engine & AI (AI)
- [ ] **AI-01** — Deterministic scam red-flag rules shall execute independently of the LLM.
- [ ] **AI-02** — NVIDIA Nemotron shall be accessed server-side through the NVIDIA API / NIM layer rather than directly from client browsers.
- [ ] **AI-03** — LLM output shall be validated against typed Pydantic backend schemas before downstream consumption.
- [ ] **AI-04** — The system shall preserve metadata identifying the specific model slug, prompt version, and inference parameters that produced an analysis.
- [ ] **AI-05** — An LLM inference result shall not by itself constitute a legal, criminal, or regulatory determination.

### Money-Mule Protection (MULE)
- [ ] **MULE-01** — The system shall detect patterns where an individual is requested to receive funds into a personal account and forward or withdraw them.
- [ ] **MULE-02** — High-risk money-mule patterns shall trigger an interruptive pre-transfer warning and immediate safe-action guidance.
- [ ] **MULE-03** — The user shall be provided a guided workflow to preserve communications and transaction details if money has already been received.

### Loan & High-Return Trap Analyzer (LOAN)
- [ ] **LOAN-01** — The system shall calculate transparent mathematical relationships between stated loan amount, actual disbursement, total repayment, hidden fees, tenure, and implied interest rates.
- [ ] **LOAN-02** — The system shall clearly separate calculated mathematical facts from model-assisted interpretations.
- [ ] **LOAN-03** — The system shall support authoritative lender identity and registration checks when registry sources are available.

### Community Intelligence & Scam Patterns (REP)
- [ ] **REP-01** — Authenticated users shall be able to submit suspicious indicators (handles, URLs, phone numbers, scripts, offers).
- [ ] **REP-02** — Submitted reports shall preserve provenance, verification level, and timestamp metadata.
- [ ] **REP-03** — Duplicate or overlapping indicator submissions shall be deduplicated and linked without losing individual provenance.
- [ ] **REP-04** — Public community views shall strictly separate unverified user reports from verified pattern signatures.
- [ ] **REP-05** — Authorized moderators shall have tooling to review, merge, verify, suppress, or correct reports.

### Official Reporting Gateway (OFF)
- [ ] **OFF-01** — Scamfy shall maintain a verified, source-backed directory of official reporting channels.
- [ ] **OFF-02** — Scamfy shall provide an emergency route for Indian cyber-financial fraud (National Cyber Crime Helpline 1930 / cybercrime.gov.in) when active financial loss is detected.
- [ ] **OFF-03** — Scamfy shall support guided official suspect-reporting handoffs for supported identifier types.
- [ ] **OFF-04** — Before any external transmission, the user shall inspect the prepared payload and provide explicit authorization.
- [ ] **OFF-05** — When no official machine-to-machine API exists, Scamfy shall provide deep links and guided step-by-step submission rather than fabricating APIs.
- [ ] **OFF-06** — Cases shall support recording user-supplied official complaint and acknowledgment reference numbers.

### Victim Case Center & Evidence Vault (CASE)
- [ ] **CASE-01** — Authenticated users shall be able to create, view, and manage private incident cases.
- [ ] **CASE-02** — Cases shall maintain a chronological incident timeline of interactions and transactions.
- [ ] **CASE-03** — Cases shall store structured transaction references, payment IDs, and communication handles.
- [ ] **CASE-04** — Cases shall support private file uploads (screenshots, receipts, PDFs) with access-controlled signed URLs.
- [ ] **CASE-05** — Scamfy shall generate clean, factual incident summaries from case data without hallucinating details.
- [ ] **CASE-06** — Case data and evidence access shall be strictly authorization-controlled per user.

---

## 2. Non-Functional Requirements & Security (SEC / UX / ENG)

### Privacy, Security & Compliance (SEC)
- [ ] **SEC-01** — Basic scam checking shall be accessible anonymously without requiring user registration.
- [ ] **SEC-02** — All API keys, secrets, and provider credentials shall remain strictly server-side.
- [ ] **SEC-03** — Provider exceptions, stack traces, and internal errors shall be sanitized before reaching users.
- [ ] **SEC-04** — Sensitive victim evidence, PII, and financial identifiers shall be excluded from analytics events and plain application logs.
- [ ] **SEC-05** — Sensitive endpoints shall enforce strict rate limiting, abuse controls, and input validation.
- [ ] **SEC-06** — Moderator actions and security-relevant case modifications shall produce immutable audit log entries.
- [ ] **SEC-07** — Object storage access for private evidence shall enforce least-privilege, short-lived signed URLs.

### User Experience & Accessibility (UX)
- [ ] **UX-01** — High-risk analysis results shall provide an immediate, unambiguous recommended next action.
- [ ] **UX-02** — Emergency financial fraud guidance shall be immediately prominent on high-urgency flows.
- [ ] **UX-03** — All interactive workflows shall be fully operable via keyboard navigation.
- [ ] **UX-04** — Typography contrast, focus indicators, and layout semantics shall meet WCAG AA standards.
- [ ] **UX-05** — Loading, empty, partial, and failure states shall provide clear user feedback and recovery paths.

### Engineering & Quality Gates (ENG)
- [ ] **ENG-01** — Deterministic rule logic and calculations shall have 100% unit test coverage.
- [ ] **ENG-02** — AI integration responses and Pydantic schemas shall have automated contract tests.
- [ ] **ENG-03** — Critical end-to-end user journeys shall have automated Playwright tests.
- [ ] **ENG-04** — Every completed milestone phase shall produce an auditable verification trail.
- [ ] **ENG-05** — Consequential architectural and product decisions shall be documented in `.planning/decisions/`.

---

## 3. Explicitly Out of Scope (OOS)

- **OOS-01** — Direct control, debiting, or credential access to bank or UPI accounts.
- **OOS-02** — Automated money transfers, chargebacks, reversals, or recovery guarantees.
- **OOS-03** — Automated judicial or legal declarations of guilt/innocence.
- **OOS-04** — Public doxxing feeds, blacklists of private citizens, or vigilante accusations.
- **OOS-05** — Reverse-engineered or undocumented government API integrations.
- **OOS-06** — General social networking features (likes, follows, friend feeds).

---

## 4. Requirement to Phase Traceability Matrix

| Requirement IDs | Primary Phase | Phase Title |
| :--- | :--- | :--- |
| **SEC-01, SEC-02, SEC-04, ENG-05, OOS-01..06** | **Phase 1** | Safety Boundaries, Threat Model & Taxonomy |
| **ENG-04, ENG-05** | **Phase 2** | Project Structure, GSD Setup & Standards |
| **SEC-06, SEC-07** | **Phase 3** | Core Data Model & Migrations |
| **UX-03, UX-04, UX-05** | **Phase 4** | Design System & Interaction Primitives |
| **DET-01, DET-03, DET-04, UX-01** | **Phase 5** | Scam Check Input & Analysis Slice |
| **DET-02, DET-05, AI-01..05, ENG-01, ENG-02** | **Phase 6** | Deterministic Risk Engine + Nemotron NIM |
| **REP-01..05** | **Phase 7** | Scam Pattern Database & Community Intel |
| **MULE-01..03, UX-02** | **Phase 8** | Money-Mule Protection & Transfer Warnings |
| **LOAN-01..03** | **Phase 9** | Loan & High-Return Trap Analyzer |
| **OFF-01..06** | **Phase 10** | Official Reporting Gateway & 1930 Route |
| **CASE-01..06** | **Phase 11** | Victim Case Center & Evidence Timeline |
| **SEC-03, SEC-05, SEC-06, SEC-07, ENG-03** | **Phase 12** | Production Security, Privacy & Hardening |
| **ENG-04** | **Phase 13** | Pilot Evaluation, Benchmarks & Release |
