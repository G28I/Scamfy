



Scamfy
What this is
Scamfy is a fraud-prevention and victim-support platform focused initially on students. It helps people recognize suspicious jobs, investment offers, loans, payment requests, money-mule recruitment, and other financial scam patterns before they cause harm. When a user is already affected, Scamfy helps them preserve evidence, organize a case timeline, prepare information for the appropriate official reporting channel, and understand what action to take next.

This project is built to be useful in the real world, not just to demonstrate an AI interface. The system must distinguish between signals, user reports, automated analysis, and facts verified by authoritative sources. It must never present an AI judgment as legal proof that a person or organization is a criminal or that a victim is legally innocent.

Read .planning/PROJECT.md, .planning/REQUIREMENTS.md, and .planning/ROADMAP.md before building anything. .planning/ is the permanent engineering record for the project: it explains why decisions were made, what was researched, what was built, what changed, and what remains open. Keep it up to date as the project evolves. Do not treat planning as optional housekeeping.

The recruiter-facing story of Scamfy is deliberate: the repository should make it possible to understand the problem, research, requirements, architecture, implementation decisions, verification, failures, and lessons learned without requiring someone to ask the author to explain the entire project from scratch.

How to work
Before building anything, decide what you are doing and why in a few plain sentences, either in the conversation or in a short planning note. Do not write implementation code at that point. Report the decision, then stop and wait for approval before moving into implementation. Every feature follows this rule, including features that appear obvious.

If something genuinely forks, where a reasonable engineer could choose two or three materially different approaches and the choice matters, ask one question at a time and present two or three concrete options. Most implementation details do not need approval: choose a sensible default, record the decision, and continue. Do not manufacture questions where no real fork exists.

Then build it. If the plan turns out to be wrong after implementation begins, or it contradicts the existing codebase, requirements, security model, or another documented decision, say so and update the plan as well as the code. Never hide a contradiction by quietly working around it.

When reporting back, anything that requires a human to perform an action, manually verify a real flow, provide credentials, make a product decision, or review sensitive material must be a short bulleted checklist of concrete steps. The detailed reasoning belongs in .planning/ as the permanent record. The reply should remain scannable.

When a build step is underway, break the work into a short checklist of the actual tasks being performed. Mark completed work in the relevant planning artifact as it finishes. Do not claim a phase is complete until the stated verification has actually passed.

Use GSD Core for the project's planning and phase workflow. Do not introduce another long-running autonomous coding loop or planning system unless there is a documented architectural reason to do so.

Rules
Functional style: pure functions by default, no shared mutable state, side effects pushed to the edges.

Immutable data by default. In TypeScript prefer const and readonly; favor map/filter/reduce where they make the code clearer instead of mutation-heavy loops.

Organize application code by feature/domain rather than creating large shared layer-wide folders that hide business boundaries.

Strict TypeScript. Do not use any. Use explicit types and validated boundaries.

Fail fast on missing required environment variables at startup. Never allow an essential configuration error to surface much later as an unrelated runtime failure.

Validate untrusted input at every external boundary. Frontend validation with Zod and backend validation with Pydantic are complementary, not substitutes for server-side validation.

Never expose secrets, API keys, access tokens, private evidence, or sensitive case data to the client unless the product explicitly requires a safe, scoped representation.

Scamfy must never expose a victim's evidence publicly by default. Screenshots, chat exports, receipts, bank communications, complaint references, and case notes are private case data and require explicit authorization for access.

Scamfy must distinguish between: user-submitted reports, automated risk signals, pattern matches, and officially verified information. Never merge them into one undifferentiated claim.

AI is advisory. Nemotron may analyze text, extract entities, identify suspicious patterns, classify scenarios, and explain signals, but the LLM must not be treated as legal authority, law enforcement, a bank, a regulator, or a definitive source of guilt or innocence.

The deterministic scam/risk rules must remain auditable. AI output may enrich an assessment but must not be the sole basis for a high-impact action such as accusing a person, publicly listing an entity as fraudulent, or submitting a legal complaint.

Never invent an official reporting integration. If an authority does not provide an authenticated integration or supported submission mechanism, Scamfy must use an official link, deep link, or guided preparation workflow instead of pretending an API exists.

Never submit a complaint, report, or other official communication without explicit user authorization at the point of submission. Preparing information and submitting information are separate actions.

Never tell a victim that Scamfy has established legal innocence, guilt, liability, or recovery of funds. Scamfy organizes evidence and guides users toward appropriate official channels; legal determinations belong to authorized institutions.

For urgent financial-fraud flows, prioritize immediate, practical actions and official reporting guidance over prolonged AI conversation. Do not bury the next action beneath analysis.

Never show a raw exception, stack trace, provider error, database error, or internal identifier to the user. Show a plain, human-readable sentence and a safe retry or next-step action.

Design for accessibility on every screen: sufficient contrast, visible focus states, semantic HTML, keyboard operation, meaningful labels, sensible error messages, and non-color-only status communication.

Shared values, spacing, typography, repeated UI patterns, and reusable interaction patterns belong in the design system, shared components, or global styles. Do not copy-paste the same visual rules across many files.

Do not add infrastructure just because it is available. Prefer the smallest architecture that satisfies the current phase. Redis, OpenSearch, additional services, queues, or other infrastructure must have a demonstrated need before they are introduced.

Never commit secrets or real victim data to the repository. Use .env.example with placeholders and synthetic test fixtures for development.

Use synthetic or anonymized data in demonstrations, screenshots, automated tests, and recruiter-facing documentation unless explicit authorization and a documented privacy basis exist.

After building or changing anything, actually run the relevant checks. At minimum, perform typechecking, linting, tests, and a production build for changes that can affect them. Fix failures before calling the step done.

For frontend changes, perform real browser verification in addition to automated tests. Automated tests are not a substitute for inspecting the actual user flow.

Every security-sensitive change requires tests and an update to the relevant planning/security documentation.

Record meaningful architecture choices as Architecture Decision Records in .planning/decisions/.

Design
Scamfy should feel trustworthy, calm, clear, and serious. Do not copy the visual language of a generic AI chatbot, crypto dashboard, gambling product, or social-media feed. The interface is for people who may be confused, pressured, embarrassed, or actively losing money, so clarity and confidence are more important than visual novelty.

The design system and visual direction must be decided and documented in the relevant .planning/ design artifact before implementation. Do not invent colors, gradients, typography, spacing, motion, or component patterns independently in individual screens.

For UI work, use the available design/frontend tooling in Antigravity when it is part of the project workflow. A visual direction must be established before building a screen. Keep animation restrained and purposeful, especially in emergency and victim-support flows.

Every risk state must be understandable without relying only on color. Prefer clear labels such as Low Risk, Needs Verification, High Risk, or Emergency Action, accompanied by explanations and next steps.

Scam Analysis Principles
Scamfy uses a layered analysis model:

User input
  -> preprocessing
  -> entity extraction
  -> deterministic rules
  -> scam-pattern lookup
  -> Nemotron analysis
  -> risk synthesis
  -> explanation + recommended action
The LLM should help interpret evidence, not replace the deterministic layer.

Examples of useful extracted entities include phone numbers, UPI identifiers, URLs, domains, amounts, dates, company names, payment instructions, deadlines, promised returns, loan terms, and references to receiving or forwarding funds.

Risk explanations should state which signals were found. Avoid unexplained numeric scores presented as if they were objective truth.

When evidence is incomplete or ambiguous, say so. The product should be comfortable with uncertain rather than manufacturing confidence.

Official Reporting
Official reporting is a core product capability, but Scamfy is not itself a law-enforcement or regulatory authority.

The reporting architecture should follow this sequence:

Detect / Understand
        -> classify the situation
        -> collect required information
        -> preserve evidence
        -> show the official reporting route
        -> let the user review the prepared information
        -> obtain explicit authorization
        -> submit only through an authenticated supported integration
           OR open the official channel for guided submission
        -> store only the case metadata needed for follow-up
Keep official channels configurable and source-backed. Never hard-code claims about government workflows without verifying the current official documentation during the relevant implementation phase.

Victim Case Management
A victim case may contain highly sensitive information. Treat case data as private by default.

A case should be capable of organizing, where applicable:

incident details

chronological timeline

transaction references

UPI/payment identifiers

phone numbers and handles

URLs and domains

screenshots and documents

bank communications

complaint/report references

the user's own explanation of what happened

Scamfy should help the user produce a clear factual timeline. It must not transform user statements into assertions of legal fact.

Community Reports
Community intelligence is valuable, but public accusation is not the product goal.

Reports should distinguish between:

raw community submissions

duplicate/clustered reports

corroborated patterns

officially verified information

Do not publish private personal information, doxxing material, harassment content, or unverified accusations. Moderation, abuse prevention, duplicate detection, and privacy controls are part of the product design, not optional polish.

Tools
Use Antigravity as the primary coding environment and GSD Core as the project-planning workflow.

The selected AI stack is NVIDIA API/NIM with NVIDIA Nemotron. Keep the provider integration behind an internal AI abstraction so model-specific code does not spread throughout the application.

The core application stack is:

Next.js + TypeScript for the web application

Tailwind CSS + shadcn/ui for UI primitives

Python + FastAPI for the backend

PostgreSQL for primary application data

SQLAlchemy for backend persistence

Redis only when caching/queue requirements justify it

Cloudflare R2 or S3-compatible object storage for private evidence

Clerk for authentication where authentication is required

Zod and Pydantic for boundary validation

Pytest and Playwright for automated testing

Sentry for error monitoring

PostHog for product analytics, with privacy-aware event design

Docker and GitHub Actions for reproducible builds and CI

Use current official documentation for fast-moving dependencies and external services. Do not rely on stale training knowledge for security-sensitive integrations, authentication, reporting channels, or provider SDK behavior.

Context files
Nested context files, if created for a specific application area, must be listed here and kept current.

.planning/PROJECT.md — product purpose, boundaries, and success definition

.planning/REQUIREMENTS.md — functional and non-functional requirements

.planning/ROADMAP.md — implementation phases and milestones

.planning/STATE.md — current project status and open issues

.planning/decisions/ — Architecture Decision Records

.planning/research/ — source-backed research and technical investigations

.planning/retrospectives/ — phase and milestone retrospectives

docs/ — recruiter-facing product, architecture, security, AI, and reporting documentation

Recruiter / Portfolio Documentation
The repository should demonstrate engineering process, not merely the final UI.

Keep the following evidence as the project develops:

why the problem was selected

who the initial users are

what assumptions were made

what research changed the design

why each major technology was selected

architecture diagrams

database decisions

AI evaluation methodology

security/privacy decisions

official-reporting design and limitations

failed approaches and why they were abandoned

verification results

performance observations

lessons learned

meaningful before/after decisions

Do not fabricate metrics, user numbers, scam reports, detection accuracy, recovery rates, or official partnerships. Demonstration data must be clearly labeled as synthetic or illustrative.

Next.js Agent Rules
This project may use a rapidly changing version of Next.js. Before writing Next.js code, inspect the installed package version and read the relevant documentation available from the installed package or the official current documentation. Do not assume that remembered APIs, conventions, or file structure are still correct.

Prefer the conventions already established by the codebase and the installed Next.js version. Resolve deprecations before introducing new code.

Definition of Done
A phase or feature is done only when:

the implementation exists

relevant tests pass

typechecking/linting pass where applicable

production build succeeds where applicable

the real user flow has been manually verified when UI is involved

security/privacy implications have been reviewed

.planning/ reflects what actually happened

important decisions are recorded

known limitations are documented

Do not mark something done because the code looks correct. Verify it.