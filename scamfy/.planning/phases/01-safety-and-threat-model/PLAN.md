# Phase 1: Product Definition, Safety Boundaries & Threat Model — Plan

- **Phase**: 01
- **Milestone**: 0 (Foundation)
- **Goal**: Establish the definitive safety boundary specification, STRIDE threat model, 7-category scam taxonomy, user role matrix, and legal disclaimers.
- **Requirements Covered**: `SEC-01`, `SEC-02`, `SEC-04`, `ENG-05`, `OOS-01..06`

---

## Tasks

### Task 1: Product Boundaries & Legal Safety Specification
- **Action**: Write `docs/safety-spec.md` formalizing:
  - Trust boundaries (User submission vs. Deterministic rules vs. Model inference vs. Official records).
  - Out-of-scope invariant enforcement (`OOS-01` through `OOS-06`).
  - Standard advisory disclaimer copy and emergency 1930 priority rule.
- **Verification**: Ensure non-goals and legal positioning align with `GSD-SEED.md` and `PROJECT-DEFINITION.md`.

### Task 2: STRIDE Threat & Abuse Model
- **Action**: Write `docs/threat-model.md` covering:
  - Malicious text injection and prompt breakout protections.
  - Doxxing prevention and privacy fences for community reports.
  - False report mitigation and rate limiting policy (`SEC-01`, `SEC-02`, `SEC-04`, `SEC-05`).
- **Verification**: Validate all STRIDE categories (Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation of Privilege) have defined architectural controls.

### Task 3: Comprehensive Scam Taxonomy & Signal Matrix (7 Core Categories)
- **Action**: Write `docs/scam-taxonomy.md` detailing:
  - **7 Core Scam Categories**:
    1. Part-Time Task & Fake Job Scams
    2. Honey-Trap / Relationship-Based Financial Recruitment
    3. Money-Mule & Account Renting
    4. Predatory Instant Digital Loans
    5. Guaranteed-Return & Fake Investment Schemes (e.g. ₹1,000 → 3.5% daily, Ponzi, fake dashboards)
    6. Urgent Impersonation & Digital Arrest / Sextortion
    7. Marketplace & Advance Fee / QR Fraud
  - Signal breakdown: Deterministic Red Flags vs. Contextual Risk Indicators.
- **Verification**: Ensure all student financial fraud vectors (specifically including romantic/social manipulation and arithmetic high-yield traps) are thoroughly mapped.

### Task 4: User Roles & Access Control Matrix
- **Action**: Write `docs/user-roles.md` specifying:
  - Anonymous User permissions (public scanning, educational resources, 1930 emergency route).
  - Authenticated User permissions (case vault, evidence uploads, timeline, indicator reporting).
  - Moderator / Administrator permissions (report triage, deduplication, indicator vetting, audit viewing).
- **Verification**: Validate alignment with Clerk auth role architecture and least-privilege principles (`SEC-07`).

---

## Verification Criteria
1. All 4 foundational specifications created in `docs/` (`safety-spec.md`, `threat-model.md`, `scam-taxonomy.md`, `user-roles.md`).
2. Requirements `SEC-01`, `SEC-02`, `SEC-04`, `ENG-05`, and `OOS-01..06` fully addressed in documentation.
3. Verification record written to `.planning/phases/01-safety-and-threat-model/VERIFICATION.md`.
