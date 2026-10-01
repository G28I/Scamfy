# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users: Indian students, young adults, consumers, and senior citizens targeted by cyber fraud, social engineering extortion, deceptive job/task offers, UPI payment traps, and money-mule recruitment schemes.

Secondary users: Community reporters and cybersecurity contributors submitting suspicious indicators (VPAs, phone numbers, phishing URLs) for moderation and public intelligence.

## Product Purpose

Scamfy is India's open, fast, and anonymous cyber fraud triage platform. It enables digital citizens to verify suspicious messages, links, and payment demands before financial loss occurs, understand the underlying deception techniques, and take immediate prioritized safe actions (blocking, bank voluntary debit holds, evidence preservation, and official 1930 / cybercrime.gov.in reporting).

## Positioning

Scamfy combines a dual-engine analysis pipeline (deterministic pattern heuristics and regex extractors paired with AI threat inference via NVIDIA Nemotron NIM) with an uncompromising privacy-by-design architecture:
- 100% anonymous scam checks without account creation or PII collection.
- Deterministic extraction and risk scoring for UPI VPAs, phone numbers, and domains.
- Real-time community threat intelligence with human moderation tiers.
- Proactive money-mule and account-rental shield with automated bank notice generation.

Unlike generic security checkers or law-enforcement portals, Scamfy operates as an instant, educational first-line triage layer to stop fraud in the "golden hour" (2–4 hours).

## Operating Context

- Immediate triage on desktop and mobile browsers when a user receives a suspicious message (WhatsApp, SMS, Telegram, email, phone call).
- Emergency pre-transfer warning modal when high-risk money-mule or reverse-payment patterns are detected.
- Step-by-step received-funds protocol to assist targeted individuals in freezing unsolicited funds, generating formal bank nodal notices, and lodging official cybercrime reports.
- Non-judicial, non-emergency advisory boundary (AI-05, OOS-03): Scamfy triages and educates, without adjudicating legal guilt or replacing formal police FIRs.

## Capabilities and Constraints

Confirmed capabilities:
- Instant message text and entity analysis with 5 risk tiers: `SAFE`, `CAUTION`, `SUSPICIOUS`, `HIGH_RISK`, `CRITICAL`.
- Extraction and normalization of technical indicators: UPI VPAs, Indian mobile numbers (+91), URLs, emails, bank accounts, and Telegram handles.
- Pre-transfer warning modal (MULE-02) and 4-step unsolicited received-funds wizard (MULE-03).
- Community threat intelligence directory (`/intel`) with verified/unverified filtering and human moderation backend (`/api/admin/reports`).
- Private victim case organizer (`/cases`) and official law enforcement reporting guide (`/report`).
- Strict rate limiting, immutable PostgreSQL audit logging (SEC-06), and zero-PII telemetry gated by cookie consent.

Technical constraints:
- Built with Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4, Prisma ORM on PostgreSQL, and FastAPI Python backend.
- Pure client/BFF isolation: server secrets never exposed to frontend bundles.

## Brand Commitments

- **Name:** Scamfy ("Shield • India")
- **Voice & Tone:** Authoritative, calm, defensive, educational, empathetic, and objective.
- **Identity Constraints:** Non-vigilante, non-judgmental, privacy-first. Always include official helpline (1930) and cybercrime.gov.in emergency pathways.
- **Visual Standards:** WCAG AA contrast compliance across all 5 risk tiers in light and dark modes, high aesthetic craft, zero raster bloat, accessible Lucide vector iconography.

## Evidence on Hand

- Production-grade codebase in `scamfy/` with 20 static/dynamic routes.
- Dual-engine implementation in `backend/app/core/evaluator.py` and `backend/app/core/extractors.py`.
- Comprehensive test coverage: 25 Vitest test suites (136 tests) and 38 backend Pytest cases.
- Authoritative Indian regulatory alignment with RBI *Know Your Customer Amendment Directions* and NCRP 1930 guidelines.

## Product Principles

1. **Safety First, Always Immediate:** Prevent financial transfers and account compromises before they happen with prominent, unambiguous directives (**DO NOT SEND**, **DO NOT TOUCH**, **REFUSE & BLOCK**).
2. **100% Privacy by Design:** Triage messages ephemerally in memory; never index raw user text publicly or broker personal data.
3. **Deterministic Transparency:** Root critical classifications in auditable, deterministic pattern rules before contextual AI enrichment.
4. **Actionable Recovery:** Guide victims through concrete steps (bank debit hold notices, evidence checklists, official portals) rather than leaving them stranded.
5. **No False Authority:** Maintain strict educational boundaries without promising fund recovery, account unfreezing, or judicial verdicts.

## Accessibility & Inclusion

- Full WCAG AA color contrast ratios ($\ge 4.5:1$ for badge labels and normal text, $\ge 3:1$ for large text and non-text graphics) across all 5 risk tiers in dark and light themes.
- Touch targets $\ge 36\text{--}44\text{px}$ and mobile viewport overflow safety.
- Modal focus management, keyboard escape handling, and screen-reader accessible labels on all form inputs.
