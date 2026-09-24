Scope: Scamfy

Scamfy is a fraud-prevention and victim-support platform focused first on students. It helps a person check suspicious job offers, investment claims, loan offers, payment requests, and money-transfer instructions before money moves; explains the signals that make something suspicious; helps victims preserve evidence; and routes them toward the appropriate official reporting channel when a real incident has already happened.

Build it as a thin, working slice first: one realistic suspicious-message check should enter the system, pass through deterministic rules plus the AI layer, return a clear explanation, and give the user a concrete next action. Then thicken the platform piece by piece. Before building anything, decide what is being built and why in a few plain sentences, then build it. If the plan turns out wrong once it is actually built, say so and update the plan as well as the code. Do not quietly work around a contradiction.

This file is the living record of how Scamfy was built. Whenever a build step actually begins, break it into a short checklist of what is genuinely being done and check each item off here as it is completed. Keep decisions, research, implementation progress, verification results, and deliberate exclusions visible enough that a fresh conversation or a recruiter can follow the project without anyone having to reconstruct the story from the codebase alone.

Stack

Already decided, nothing open here: Antigravity for coding, GSD Core for planning and execution workflow, Next.js (App Router) with TypeScript for the web application, Tailwind CSS and shadcn/ui for the interface, Python with FastAPI for the backend, PostgreSQL for persistent data, SQLAlchemy for backend database access, Redis for queue/cache needs when they are actually required, Cloudflare R2 or S3-compatible object storage for private evidence files, Clerk for authentication, Pydantic for backend validation, Zod for frontend validation, NVIDIA API / NIM for model access, and NVIDIA Nemotron as the AI model family. Playwright is used for browser-level verification and Pytest for backend/unit testing. Vercel is the preferred frontend deployment target, with Railway or Render for the backend. Sentry is used for error monitoring and PostHog for product analytics when those integrations are introduced.

The AI layer is not the authority. Scamfy combines deterministic rules, structured signals, known scam patterns, and Nemotron analysis. The model explains and interprets; the application must keep the reasoning auditable and must never present an AI classification as a legal finding of guilt or innocence.

Planning & project record

The repository should keep .planning/ as the authoritative development record. docs/ is the recruiter-facing explanation of what Scamfy is and how the system works; .planning/ is the chronological evidence of how it was designed, decided, implemented, tested, and changed.

Important decisions belong in .planning/decisions/. Phase-specific research, context, plans, summaries, and verification belong under .planning/phases/. Do not create a second competing planning system just to duplicate GSD's work.

The project uses GSD Core with Antigravity. Ralph Loop is deliberately not part of Scamfy.

Sketches

There are no final visual decisions stored in this scope yet. When sketches or reference screens are added, treat them as structural references: what exists, where information sits, how the user moves through the flow, and what the important hierarchy is. Do not treat a sketch as permission to copy colors, typography, or decorative treatment blindly. If a sketch genuinely contradicts a written product requirement, stop and resolve the contradiction instead of guessing.

At a glance

#

Feature

Phase

Status

1

Product definition, safety boundaries, and threat model

Foundation

planned

2

Project structure, GSD workflow, and coding standards

Foundation

planned

3

Core data model

Foundation

planned

4

Design system and interaction direction

Foundation

planned

5

Scam Check input and analysis slice

Slice 1

planned

6

Deterministic risk engine + Nemotron analysis

Slice 1

planned

7

Scam pattern database and community reporting

Slice 2

planned

8

Money-mule detection and transfer-risk warnings

Slice 2

planned

9

Loan and high-return trap analyzer

Slice 3

planned

10

Official reporting gateway

Slice 3

planned

11

Victim Case Center and evidence timeline

Slice 4

planned

12

Security, privacy, moderation, and production hardening

Hardening

planned

13

Pilot, evaluation, analytics, and deployment

Pilot

planned

Foundation

1. Product definition, safety boundaries, and threat model

Define exactly what Scamfy is trying to prevent, what a high-risk signal means inside the product, and what Scamfy must never claim. The first target population is students exposed to fake jobs, fake investments, money-mule recruitment, predatory digital loans, payment fraud, phishing, and financially motivated social engineering such as honey-trap recruitment. The system should help users act earlier, preserve evidence, and reach official channels, not replace police, banks, regulators, lawyers, or courts.

Define the trust boundaries before building the AI flow: a suspicious report is a user-provided signal, an AI explanation is advisory, an official verification is stronger evidence, and a legal determination belongs to the relevant authority. Define abuse cases too: false reports, harassment, doxxing, malicious uploads, prompt injection, fraudulent evidence, and attempts to use Scamfy to investigate or target private individuals.

Decide the product boundaries

Write the safety and abuse model

Define the scam taxonomy

Define the user roles

Write the Phase 1 project specification

2. Project structure, GSD workflow, and coding standards

Set up the repository around features rather than arbitrary global layers. Keep the application understandable to both the coding agent and a human reviewer. Establish AGENTS.md, the .planning/ structure, the recruiter-facing docs/ area, environment-variable policy, testing conventions, linting/formatting, and the Definition of Done.

Antigravity is the coding agent. GSD Core is the planning and workflow system. Do not add another autonomous coding loop unless the architecture changes enough to justify it explicitly.

Decide the repository structure

Finalize AGENTS.md

Establish .planning/ and docs/

Install and configure linting, formatting, and test tooling

Write the coding-standards record

3. Core data model

Model only the information needed to support the first slices without inventing a giant schema. Core entities are users, scam checks, risk signals, scam patterns, community reports, cases, evidence metadata, transactions, reporting records, and audit events. Sensitive evidence files themselves belong in private object storage; PostgreSQL stores metadata and relationships.

A user report should not be treated as proof. A case can contain the user's narrative and evidence without declaring the user legally innocent or the reported party legally guilty.

Decide the schema

Write the database model

Add migrations

Add seed/test data

Verify core relationships and access boundaries

4. Design system and interaction direction

Scamfy should feel calm, trustworthy, serious, and easy to understand under stress. The interface must prioritize clarity over gamification. Risk states need strong hierarchy without sensational copy. Primary actions should be obvious, especially when a person has already transferred money. Destructive or irreversible actions require explicit confirmation.

The design system should live in shared tokens/components rather than repeated styling. Every screen needs an accessibility baseline: usable contrast, visible focus, keyboard operation, readable status messaging, and clear error recovery.

Decide the visual direction

Define type, spacing, radii, and semantic color tokens

Build shared primitives

Verify accessibility basics

Record the design decision in .planning/decisions/

Slice 1: Core Scam Check

5. Scam Check input and analysis slice

The first working slice should be deliberately small. A user should be able to paste a suspicious message, job offer, investment claim, loan offer, or payment instruction and receive a structured analysis. Support text first; URLs, screenshots, documents, and richer evidence can follow after the core flow works.

The screen should explain what was detected, why it matters, and what the user should do next. Do not use a bare score with no explanation. Do not make the interface claim certainty where the evidence is ambiguous.

Decide the first input/output contract

Build the input screen

Build the analysis API

Build the result screen

Verify one complete real flow end to end

6. Deterministic risk engine + Nemotron analysis

Build the fraud-analysis pipeline as multiple layers. Normalize the input, extract entities and high-value phrases, apply deterministic rules, look for known scam patterns, call Nemotron for interpretation, and combine the resulting signals into a structured risk assessment. The final response should be explainable in plain language.

The application must isolate provider failures from user-facing messaging. A model outage or timeout should result in a human-readable explanation and a retry path, not a raw exception. AI-generated content should be bounded by a schema and validated before it reaches the UI.

Decide the risk-signal schema

Implement deterministic red-flag rules

Add scam-category classification

Add Nemotron integration through NVIDIA API / NIM

Define structured model output validation

Combine rule and model signals

Add provider failure handling

Build representative evaluation cases

Verify false-positive and false-negative behavior on the initial dataset

Slice 2: Community intelligence & money-mule protection

7. Scam pattern database and community reporting

Allow authenticated users to submit suspicious indicators such as phone numbers, URLs, Telegram/WhatsApp handles, email identifiers, payment identifiers, job offers, and loan offers. Store reports as evidence-backed signals rather than public accusations. De-duplicate overlapping reports and maintain confidence based on the quality and consistency of evidence.

Public-facing views should separate community reports from officially verified information. Victim identity and private evidence must never become publicly searchable by accident.

Decide the report schema and moderation rules

Build report submission

Build duplicate/pattern matching

Build moderation states

Build public pattern pages without exposing private evidence

Verify privacy boundaries

8. Money-mule detection and transfer-risk warnings

Detect patterns where a user is asked to receive money into a personal account and forward it, cash it out, convert it, or move it for someone else in exchange for a commission or job payment. The system should explain the risk plainly and interrupt the user before they continue when the signal is strong.

The product should explicitly distinguish “possible money-mule recruitment” from a legal finding. If a user already received suspicious funds, switch from prevention to evidence-preservation and official-reporting guidance rather than encouraging another transfer.

Define money-mule indicators

Implement detection rules

Add Nemotron interpretation for ambiguous cases

Build pre-transfer warning UX

Build already-received-funds flow

Verify action recommendations and failure states

Slice 3: Financial traps & official reporting

9. Loan and high-return trap analyzer

Support structured analysis for suspicious loan offers and implausible return claims. Explain the difference between the stated amount, the amount actually received, the repayment amount, the repayment window, and the implied cost. For investment offers, make extreme return claims understandable with simple arithmetic rather than relying only on a risk score.

The system should guide users to verify the lender/institution, terms, total cost, and official status where appropriate. It should never impersonate a regulator or declare an offer illegal solely because an AI model says so.

Define loan and investment input schemas

Implement financial calculations

Implement high-return anomaly rules

Add model-assisted explanation

Build loan/investment result flows

Verify calculations with deterministic tests

10. Official reporting gateway

This is a first-class Scamfy feature. Once a user has enough information to act, Scamfy should route them toward the appropriate official reporting/support channel for the situation. The workflow is: classify the incident, prepare the evidence, show the official route, let the user review the information, and then either deep-link/guided-submit through a supported mechanism or explain exactly what to do manually.

Do not invent an integration. Do not claim that Scamfy has filed a complaint when it has only prepared a report or opened an official site. Direct submission requires an officially supported mechanism and explicit user authorization. Keep a record of what Scamfy prepared and what the user says they submitted, without pretending to control the external case.

A financial-fraud incident should have an emergency path where the user is immediately directed to the appropriate official reporting/contact route rather than being buried under AI analysis. The gateway should also support non-cyber grievance paths when the case genuinely belongs elsewhere.

Define official reporting routes and source-of-truth rules

Design the reporting decision tree

Build complaint/evidence preparation

Build official-route deep links or supported submission flows

Add explicit user authorization before submission

Build submission-status recording

Test the emergency path with realistic cases

Slice 4: Victim support

11. Victim Case Center and evidence timeline

Give victims one place to organize what happened. A case contains the user's narrative, a chronological timeline, transaction/reference numbers, contact identifiers, URLs, screenshots, receipts, bank communications, official complaint references, and notes on actions already taken.

The system should help generate a clean incident summary from the structured evidence, but it must preserve what is user-provided versus AI-generated. Evidence access is private and role-controlled. Deletion, export, and sharing actions must be explicit.

For an account-blocked or disputed-transaction situation, Scamfy should help the person document what they know and prepare a factual explanation. It must not issue a legal conclusion about guilt or innocence.

Decide the case schema

Build case creation

Build evidence upload and metadata

Build timeline management

Build incident-summary generation

Build complaint/reference tracking

Verify access control and private storage

Hardening

12. Security, privacy, moderation, and production hardening

Scamfy handles sensitive financial, contact, and incident information, so security is a core product requirement rather than a final polish step. Protect private evidence, validate every input, enforce authorization on every case/evidence operation, rate-limit abuse, log security-relevant actions, protect secrets, and prevent prompt injection from turning user-provided text into arbitrary system behavior.

Community reports need moderation and abuse controls. The product must be resilient to spam, fake reports, targeted harassment, mass reporting, malicious files, and attempts to expose private people. Raw provider errors and stack traces never reach the user.

Threat-model the full application

Verify authentication and authorization boundaries

Verify evidence-storage security

Add rate limiting and abuse controls

Add audit logs

Add security-focused tests

Run dependency/security checks

Perform manual privacy review

Run production build, typecheck, lint, unit tests, and E2E tests

Pilot

13. Pilot, evaluation, analytics, and deployment

Ship Scamfy to a small controlled student audience before treating it as a general public product. Evaluate the system with a balanced set of legitimate, suspicious, and ambiguous examples. Measure where the detector is wrong, where users misunderstand the explanation, and whether the next action is actually clear.

Analytics should measure product behavior without turning victim data into a marketing dataset. Do not log sensitive evidence into analytics providers. Keep model-quality evaluation separate from personally identifying incident data.

Define the pilot population and test protocol

Create an evaluation dataset

Measure precision/recall and category accuracy

Measure end-to-end task completion

Review false positives and false negatives

Add privacy-safe analytics

Deploy the web and API

Run real browser verification in production

Record the pilot retrospective

Research log

The permanent record of external research belongs in .planning/research/. Every external fact that affects product behavior, reporting routes, regulated-entity verification, or legal/safety copy should have a source and date recorded there rather than being remembered informally.

When a government, regulator, payment provider, or other official body changes a reporting process, update the relevant research and the affected feature plan before changing implementation.

Decision log

Major technical/product decisions should be captured as short ADR-style notes under .planning/decisions/, including the decision, alternatives considered, reason for the choice, consequences, and date.

Initial decisions to record:

Antigravity is the primary coding agent.

GSD Core is the project planning/workflow system.

Ralph Loop is not used for Scamfy.

Nemotron is the chosen AI model family, accessed through NVIDIA API / NIM.

Scam classification uses rules + structured signals + AI rather than an LLM-only verdict.

FastAPI owns the core backend/application data model; do not create competing sources of truth without a concrete reason.

Private victim evidence is stored outside the relational database, with only metadata and access-controlled references in PostgreSQL.

Official reporting is a gateway/preparation layer unless a real, supported integration exists.

Scamfy never declares a person legally guilty or innocent.

Definition of done

A feature is not complete because the code compiles. A feature is complete only when the intended flow works, the important failure states have been handled, the implementation has been tested, and the planning record has been updated.

For every meaningful build step:

The plan/decision is written before coding begins

The implementation is complete

Typecheck passes

Lint passes

Unit/integration tests pass where applicable

A real browser/user flow has been verified where applicable

Production build succeeds

Security/privacy implications have been reviewed

.planning/ has been updated with what changed and what was learned

Not doing right now

Kept here so the scope stays honest about what is deliberately deferred.

Full social-feed functionality or a LinkedIn/Instagram-style follower system. Community intelligence comes before social networking.

Automatic public naming-and-shaming of alleged scammers.

A public blacklist that treats user reports as confirmed facts.

Direct access to bank accounts, UPI accounts, or law-enforcement databases unless a legitimate supported integration exists and the user has authorized it.

Claiming or guaranteeing recovery of stolen money.

Legal representation, legal advice, or automated declarations of innocence/guilt.

Fully autonomous reporting with no user review or authorization.

Nationwide financial-regulatory verification for every institution on day one.

A giant microservice architecture before traffic or operational needs justify it.

A second autonomous coding loop such as Ralph.

Training a foundation model from scratch for Scamfy's MVP.

Collecting more identity information than the product feature actually requires.

Publicly exposing victim evidence, transaction details, screenshots, or case histories by default.

A native mobile app before the web product proves the core workflow.