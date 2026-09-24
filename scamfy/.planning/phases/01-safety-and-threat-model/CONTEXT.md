# Phase 1: Product Definition, Safety Boundaries & Threat Model — Context

## Goal
Establish the foundational safety specification, abuse threat model, user role permissions, scam classification taxonomy, and legal disclaimers/trust boundaries for Scamfy v1.

## Scope & Deliverables
1. **Safety Boundaries & Invariants**:
   - Define exact trust boundaries: user report vs. deterministic rule vs. AI inference vs. official verification.
   - Formalize non-goals and out-of-scope behaviors (`OOS-01` through `OOS-06`).
   - Define legal posture: advisory explanation only, no judicial findings of guilt/innocence.
2. **Threat & Abuse Model (STRIDE-based)**:
   - Identify abuse vectors: malicious submissions, prompt injection via user text, doxxing attempts, false reports against innocent parties, fake evidence.
   - Define mitigations and security policies (`SEC-01`, `SEC-02`, `SEC-04`).
3. **Scam Category Taxonomy & Signal Hierarchy**:
   - Establish primary scam categories:
     1. Part-Time Task & Fake Job Scams
     2. Honey-Trap / Relationship-Based Financial Recruitment
     3. Money-Mule & Account Renting
     4. Predatory Instant Digital Loans
     5. Guaranteed-Return & Fake Investment Schemes
     6. Urgent Impersonation & Digital Arrest / Sextortion
     7. Marketplace & Advance Fee / QR Fraud
   - Classify signals into deterministic red flags vs. contextual indicators.
4. **User Role & Permission Matrix**:
   - Anonymous user (Public scan, educational guidance, emergency 1930 routing).
   - Authenticated student/victim (Case creation, evidence upload, timeline, community reporting).
   - Moderator/Admin (Indicator review, pattern deduplication, route management, audit inspection).

## Linked Requirements
- `SEC-01`: Anonymous access for basic scam checking.
- `SEC-02`: Server-side isolation of secrets & AI keys.
- `SEC-04`: Exclusion of victim PII from analytics/logs.
- `ENG-05`: Architectural decisions recorded as ADRs.
- `OOS-01..06`: Strict adherence to out-of-scope boundaries.
