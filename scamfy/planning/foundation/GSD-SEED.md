# Scamfy — GSD Initialization Seed

Use this file as the single source document for the first GSD Core initialization. It summarizes the approved foundation; the individual documents in the same folder remain the detailed human-readable source of truth.

## Project Definition

Scamfy is a student-first fraud-prevention and victim-support platform. It helps users assess suspicious jobs, investments, loans, payment requests, and money-transfer requests before acting; explains concrete risk signals; and, after an incident, helps preserve evidence and reach the appropriate official reporting route.

Scamfy is not a police service, bank, regulator, court, legal service, or guaranteed recovery service. It does not make legal guilt/innocence determinations.

Core value:

> Before money moves, help the user understand the risk. After money moves, help the user act quickly, preserve evidence, and reach the correct official channel.

Primary users: students, victims/affected account holders, colleges/student organizations, and authorized moderators/administrators.

## Product Scope

### V1

- Scam Check for suspicious text and offer details.
- Deterministic scam rule engine.
- NVIDIA Nemotron analysis through NVIDIA API/NIM.
- Explainable risk assessment.
- Money-mule protection.
- Loan-trap analysis and transparent calculations.
- Community scam-pattern reporting with provenance.
- Official reporting gateway with source-backed routing and explicit user authorization.
- Victim Case Center with timeline and private evidence.
- Privacy, authorization, moderation, security, testing, and observability foundations.

### Later

OCR enrichment, multilingual analysis, college dashboards, advanced campaign clustering, verified official API integrations where actually published, and a native mobile client.

### Never in v1

Direct bank-account control, automated fund movement/reversal/recovery, automated legal determinations, public doxxing/accusation feeds, unofficial government integrations, and a generic social network before the safety core works.

## Technology Decisions

- Coding environment: Google Antigravity.
- Development methodology: GSD Core.
- AI provider: NVIDIA API / NIM.
- Model family: NVIDIA Nemotron; verify the exact production model slug at implementation time.
- Frontend: Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui.
- Backend: Python + FastAPI.
- Database: PostgreSQL.
- Data access: SQLAlchemy on the backend.
- Object storage: Cloudflare R2 or S3-compatible storage for private evidence.
- Redis: only when concrete caching/rate-limit/background-job requirements justify it.
- Authentication: Clerk, subject to implementation-time verification of its current integration guidance.
- Validation: Pydantic + Zod.
- Monitoring: Sentry with privacy-safe configuration.
- Analytics: PostHog with sensitive content excluded.
- Testing: Pytest + Playwright.
- Deployment: Vercel for web; Railway/Render or equivalent for API.
- No Ralph Loop.
- No Groq dependency for Scamfy inference.

## Architecture Principles

1. Start as a modular monolith.
2. Keep browser code isolated from secrets and trusted operations.
3. Treat FastAPI as the trust boundary for AI, storage, database, and reporting operations.
4. Use a layered analysis path: normalization → entity extraction → deterministic rules → pattern matching → Nemotron analysis → risk aggregation → action recommendation.
5. AI output is advisory and must be schema-validated.
6. Risk results retain the signals and provenance that support them.
7. Separate official facts, community reports, model inference, and Scamfy-generated patterns.
8. Private evidence is not public data.
9. Consequential external submissions require explicit user review and authorization.
10. Never fabricate an official integration; if no supported API exists, provide a deep link and guided submission.
11. External source records require provenance and verification timestamps.
12. All sensitive endpoints need authentication/authorization as appropriate, rate limiting, auditability, and safe error handling.
13. Test deterministic logic independently from the model.
14. Optimize for user safety and clarity, not for the appearance of certainty.

## GSD Planning Expectations

GSD must turn this approved foundation into the canonical `.planning/` artifacts, including PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, config.json, and research outputs. The roadmap should preserve the 12-phase product direction already documented in the project's Scope.md, while allowing GSD to adjust phase boundaries where its research shows a better dependency order.

Every phase must have a visible plan, implementation checklist, summary, and verification trail. Planning documents are committed to git so a recruiter can inspect how the project evolved.

## Source Documents

The detailed foundation is maintained in:

- `PROJECT-DEFINITION.md`
- `PRD.md`
- `REQUIREMENTS.md`
- `ARCHITECTURE-PRINCIPLES.md`

Do not silently override these constraints. Any material change must be documented as a decision and reflected in the appropriate planning artifact.
