# Scamfy — Project Definition

## 1. What Scamfy is

Scamfy is a student-first fraud-prevention and victim-support platform. It helps a person assess a suspicious job offer, investment opportunity, loan, payment request, or money-transfer request before they act; explains the signals that make the situation risky; and, when a person has already been affected, helps them preserve evidence and reach the appropriate official reporting channel.

Scamfy is not a police department, bank, regulator, court, legal-service provider, or guaranteed money-recovery service. It does not decide that a person is legally guilty or innocent.

## 2. Problem

Students are frequently exposed to attractive financial opportunities through messaging apps, social media, job advertisements, and informal referrals. A scam can cause direct financial loss, identity exposure, or the student becoming an unwitting participant in suspicious transactions such as money-mule activity.

The product problem is therefore not only "detect scams." It is the larger decision gap between receiving a suspicious offer and taking the next safe action.

## 3. Core value proposition

> Before the money moves, help the user understand the risk. When money has already moved, help the user act quickly, preserve evidence, and reach the correct official channel.

## 4. Primary users

### Students

People receiving part-time jobs, internships, investment offers, loan offers, payment requests, or requests to receive and forward money.

### Victims / affected account holders

People who have already lost money, received suspicious funds, had an account restricted, or need help organizing evidence and complaint information.

### Colleges and student organizations

Organizations that need aggregate awareness of scam patterns affecting their community without exposing victim identities.

### Moderators / trusted administrators

Authorized staff responsible for reviewing community reports, handling abuse, maintaining verified-source information, and auditing high-risk content.

## 5. Core use cases

1. Check a suspicious message or offer.
2. Detect potential money-mule recruitment.
3. Analyze suspicious loan economics and lender information.
4. Detect high-risk investment-return patterns.
5. Submit a structured community scam report.
6. Build an evidence timeline after an incident.
7. Route the user to an official reporting channel.
8. Track the status of the user's Scamfy case and the official complaint reference they provide.
9. Help colleges understand emerging scam patterns through aggregate, privacy-safe intelligence.

## 6. Vision

Build a trustworthy safety layer between people and fraud: fast enough to use before a payment, transparent enough to explain why a warning was produced, and responsible enough to direct victims to official authorities instead of pretending to replace them.

## 7. Product principles

### Prevention first

The product should optimize for stopping the next harmful action, not merely describing what happened after the fact.

### Explain the warning

Every material risk warning should expose the concrete signals behind it. The user should not have to trust an unexplained AI label.

### Official-source first

Reporting guidance must be based on official or otherwise authoritative sources. For Indian cyber-financial fraud, Scamfy should surface the current official 1930 / National Cyber Crime Reporting Portal workflow rather than inventing a substitute.

### AI is advisory, not authoritative

Nemotron can extract, classify, summarize, compare, and explain. It must not be treated as the sole authority for a fraud or legal determination.

### Evidence over accusation

Community intelligence should preserve indicators and evidence, not turn unverified user reports into public declarations that a person is a criminal.

### Minimum necessary data

A person should be able to perform a basic scam check without creating an account. Sensitive evidence is private by default and is only exposed through explicit authorization.

### Human control at consequential steps

A user must review and explicitly authorize any action that would transmit a complaint or sensitive evidence to an outside authority, where an official integration supports such transmission.

### Build a thin working slice first

The first implemented slice must be useful end-to-end before the product is made broader. Complexity is added only when a demonstrated user need requires it.

## 8. Constraints

- Primary development environment: Google Antigravity.
- Planning methodology: GSD Core.
- AI provider: NVIDIA API / NIM.
- Primary model family: NVIDIA Nemotron.
- Backend: Python + FastAPI.
- Frontend: Next.js + TypeScript.
- Database: PostgreSQL.
- Initial architecture: modular monolith, not microservices.
- No Ralph Loop.
- No dependency on Groq for Scamfy inference.
- No fabricated government API integrations.
- No automatic publication of unverified accusations.
- No claim of guaranteed money recovery.

## 9. Success measures

### User outcome

A user can move from a suspicious offer to a clear, justified safety action in a small number of steps.

### Detection quality

Scamfy must be evaluated separately for false positives, false negatives, category accuracy, entity extraction accuracy, and explanation usefulness.

### Response quality

For incidents involving possible financial fraud, the product should surface appropriate official next steps without burying the urgent action beneath educational content.

### Trust

A reviewer can determine why a risk result was generated, what evidence was supplied by the user, which facts came from authoritative sources, and where uncertainty remains.

### Engineering quality

Every phase has an auditable plan, implementation summary, tests, verification evidence, and known limitations recorded in the planning history.

## 10. Non-goals for the initial product

- Replacing police, banks, courts, regulators, or legal professionals.
- Guaranteeing recovery of lost funds.
- Publicly identifying a person as a criminal solely from community reports.
- Building a generic social network feed before the core safety workflows work.
- Building a universal global fraud database on day one.
- Performing autonomous legal decisions.
- Automatically filing complaints through undocumented or unofficial interfaces.

## 11. Definition of a successful v1

A student can paste or upload a suspicious offer, receive a transparent risk assessment with concrete red flags, understand what action to take, and—when appropriate—move into a guided official-reporting or victim-case workflow without losing the original evidence.
