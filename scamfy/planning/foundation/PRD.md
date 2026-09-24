# Scamfy — Product Requirements Document

## 1. Product summary

Scamfy is a fraud-prevention and victim-support platform focused initially on students in India. It combines deterministic scam signals, community-reported patterns, and NVIDIA Nemotron-assisted analysis to help users recognize risky opportunities and take the next safe action.

The product has two modes:

1. **Prevent** — identify risk before money, credentials, or account access is handed over.
2. **Respond** — help affected users preserve evidence, organize a case, and reach the appropriate official reporting route.

## 2. Primary user stories

### Student checking a new opportunity

As a student, I want to paste a job, investment, loan, or payment message into Scamfy so that I can understand whether the offer contains recognizable risk signals before I act.

### Student facing money-mule recruitment

As a student, I want Scamfy to recognize when someone is asking me to receive and forward money through my personal account so that I can stop before becoming involved in suspicious transaction activity.

### Student evaluating a loan

As a borrower, I want Scamfy to calculate the relationship between the amount advertised, the cash actually received, repayment amount, fees, and duration so that I can see when a loan is economically dangerous or misleading.

### Victim after payment

As a victim, I want immediate, prioritized instructions and a place to preserve transaction details and evidence so that I can act quickly and avoid compounding the loss.

### Account holder with a restricted account

As an affected account holder, I want to build a chronological case file containing my transactions, communications, evidence, and explanations so that I can present a coherent record to my bank or the relevant authority.

### Community reporter

As a user, I want to report a suspicious number, URL, UPI identifier, handle, loan app, or job campaign so that repeated patterns can be detected and other users can be warned without exposing my private evidence.

### College / organization

As a college or student organization, I want aggregate scam-pattern information so that I can warn students about emerging threats without receiving unnecessary personal information about victims.

## 3. Core user journeys

### Journey A — Check before acting

```text
Landing page
  ↓
Choose/check input
  ↓
Paste message / URL / offer details
  ↓
Preprocess + extract entities
  ↓
Rule engine evaluates known risk signals
  ↓
Nemotron analyzes language/context
  ↓
Risk engine combines signals
  ↓
Human-readable explanation
  ↓
Recommended next action
```

### Journey B — Possible money-mule recruitment

```text
User pastes job/payment request
  ↓
Detect receive-and-forward pattern
  ↓
Raise dedicated money-mule warning
  ↓
Tell user not to move unexplained funds onward
  ↓
Preserve communication + transaction evidence
  ↓
Offer official reporting / bank-contact guidance
```

### Journey C — Financial fraud just happened

```text
"I already sent money"
  ↓
Emergency guidance
  ↓
Surface official immediate reporting route
  ↓
Collect transaction/UTR/payment details
  ↓
Create incident timeline
  ↓
Prepare complaint information
  ↓
User reviews
  ↓
Official submission / official portal handoff
```

### Journey D — Suspicious account / identifier

```text
Enter identifier
  ↓
Normalize
  ↓
Check Scamfy reports + authoritative sources available to Scamfy
  ↓
Show evidence-backed matches
  ↓
Clearly label community reports vs verified information
  ↓
Offer official suspect-reporting route
```

## 4. Feature requirements

### 4.1 Scam Check

Inputs supported in v1:

- plain text
- job offer text
- investment offer text
- loan terms
- payment instructions
- URLs
- selected identifiers such as phone number, UPI ID, email, or messaging handle

Output must include:

- risk level: Low / Moderate / High / Critical where justified by defined rules
- scam category or categories
- concrete red flags
- extracted entities
- uncertainty notes where evidence is incomplete
- recommended action
- relevant official guidance where applicable

The output must not state that an individual or organization is legally guilty based solely on an AI assessment.

### 4.2 Rule Engine

The rule engine provides deterministic and auditable signals such as:

- guaranteed or implausibly high returns
- upfront registration/security payments
- requests to receive and forward money
- urgency or coercive deadlines
- credential or OTP requests
- suspicious installation/download requests
- loan economics that materially contradict the headline amount
- repeated identifiers linked to prior reports

Rules must produce machine-readable evidence objects so the explanation layer can cite the underlying signal.

### 4.3 Nemotron analysis

Nemotron is responsible for language and reasoning tasks such as:

- classify likely scam category
- extract entities and transaction instructions
- summarize the user's situation
- identify missing information
- explain why a pattern is concerning
- draft a factual incident summary

The model must return structured output validated by the backend schema.

The system must record model name/version and analysis metadata necessary for reproducibility and debugging without storing more user content than necessary.

### 4.4 Risk engine

The risk engine combines deterministic rules, pattern matches, model output, and confidence/uncertainty signals into an auditable assessment.

The risk engine must not use a single opaque LLM score as the sole determinant.

A final result should preserve:

- signals observed
- sources of signals
- model contribution
- confidence/uncertainty
- final action recommendation

### 4.5 Money-mule protection

The platform must identify language patterns such as:

- "receive money for us"
- "use your bank account"
- "forward the payment"
- "keep a commission"
- "we will send money to your account"
- "transfer it to another account"

The exact phrases are not the rule; the system must reason about the underlying transaction pattern.

The user-facing warning must emphasize stopping further movement of unexplained funds and preserving evidence, without making an unsupported legal conclusion.

### 4.6 Loan Trap Detector

The module accepts advertised amount, actual disbursement, repayment amount, duration, fees, and other disclosed charges.

It calculates transparent derived values and explains them in plain language.

Where lender identity is supplied, Scamfy may provide a verification workflow based on authoritative regulator information available to the system.

Digital-lending guidance should reflect official RBI requirements and terminology where relevant, including disclosure of the all-inclusive cost/APR and Key Fact Statement expectations for regulated digital lending. urlRBI digital lending guidelineshttps://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12382

### 4.7 Scam Pattern Reports

Users can report suspicious indicators and campaigns.

Reports should support:

- category
- indicator type
- normalized identifier
- narrative
- evidence metadata
- date observed
- geographic/community context when voluntarily provided

Sensitive evidence remains private unless the user explicitly chooses to submit it to an official destination or authorized Scamfy moderation workflow.

The system must deduplicate reports and preserve provenance.

### 4.8 Trust / verification labels

Every externally sourced claim should be attributable to a source type:

- Official
- User reported
- Scamfy detected pattern
- Community corroborated
- Unverified

The interface must never visually collapse these categories into one undifferentiated "truth" state.

### 4.9 Official Reporting Gateway

The reporting gateway must classify the incident and identify the appropriate official next step.

For Indian cyber-financial fraud, Scamfy should provide the current official National Cyber Crime Reporting Portal / 1930 route. The current portal states that 1930 is the 24×7 helpline for immediate reporting of cyber-financial fraud. urlNational Cyber Crime Reporting Portalhttps://www.cybercrime.gov.in/

The portal also supports a "Report Suspect" facility for items including suspicious website URLs, WhatsApp numbers, Telegram handles, phone numbers, email IDs, SMS identifiers, and social-media URLs. urlI4C Report Suspecthttps://www.cybercrime.gov.in/Webform/cyber_suspect.aspx

Scamfy should therefore support:

1. classify the case
2. assemble known facts
3. generate a structured complaint draft
4. show the user exactly what will be shared
5. obtain explicit user authorization
6. either submit through a verified official integration or deep-link to the official channel for guided submission
7. capture the official complaint/reference number if the user provides it

No undocumented direct submission mechanism may be invented.

### 4.10 Victim Case Center

A case contains:

- incident date/time
- incident category
- narrative
- transaction records
- UTR/reference IDs
- payment method
- suspect identifiers
- communications
- uploaded evidence
- timeline events
- official complaint references
- bank communications
- user notes

The case timeline is append-only from the user perspective where practical, with edits preserved as audit history for sensitive records.

### 4.11 Evidence handling

Supported evidence may include images, PDFs, text exports, transaction receipts, and communication exports.

Evidence must be private by default, access-controlled, encrypted in transit, and stored separately from relational metadata.

The system must never expose another user's evidence in public search.

### 4.12 Community / college intelligence

Aggregate pattern views may show counts, categories, time windows, and repeated indicators while suppressing personal identifiers unless there is a documented, legitimate reason to disclose them.

The system should prefer pattern-level warnings over public accusations.

## 5. UX requirements

The primary safety flow must work with minimal friction.

Every high-risk state must answer:

1. What is suspicious?
2. Why is it suspicious?
3. What should I do now?
4. What evidence should I preserve?
5. Where can I report it officially?

The emergency path for active financial fraud must put the immediate action above educational detail.

Error messages must be human-readable and must never expose raw stack traces, provider errors, prompts, secrets, or internal identifiers.

Accessibility baseline:

- keyboard operation
- visible focus
- sufficient contrast
- semantic labels
- screen-reader-friendly status updates

## 6. Privacy and safety requirements

- Basic scam checking does not require an account.
- Authentication is required for saved cases, uploaded evidence, and account-linked reporting features.
- Sensitive evidence is private by default.
- Personally identifiable information is minimized and retained only where necessary.
- Community reports cannot automatically publish a person's identity as a confirmed criminal.
- AI outputs must include uncertainty where appropriate.
- High-impact actions require explicit user confirmation.
- Official sources and integrations require provenance and verification dates.
- The platform must include abuse controls against spam reporting, harassment, and malicious submissions.

## 7. Admin / moderation requirements

Initial moderation capabilities:

- review queued reports
- merge duplicate reports
- mark report provenance
- remove malicious/abusive content
- correct taxonomy errors
- maintain official-source records and last-verified timestamps
- audit moderator actions

Full enterprise/admin functionality is not required for the first thin slice.

## 8. Non-functional requirements

### Reliability

One failed provider call or malformed user input must not corrupt a case or crash the whole request path.

### Performance

Basic text analysis should feel interactive. Long-running evidence processing should move to an asynchronous job when introduced.

### Security

Secrets remain server-side. User evidence must not be accidentally exposed through logs, analytics, URLs, or client-side state.

### Observability

Track request outcomes, model latency, rule execution, and error classes while excluding unnecessary sensitive user content from telemetry.

### Testability

Rule engine logic must be unit testable without an LLM. AI response schemas must be contract tested. Critical user journeys require E2E coverage.

## 9. MVP boundary

### Must have

- Scam Check for text
- deterministic rule engine
- Nemotron-backed analysis
- explainable risk result
- money-mule detection
- loan-trap calculator/analyzer
- suspicious-pattern reporting
- official reporting handoff
- basic victim case file
- secure evidence metadata model
- authentication for saved/private cases
- moderation foundation
- automated tests and verification

### Can follow after the core loop

- image/receipt OCR enrichment
- richer URL reputation checks
- college dashboards
- multilingual support
- advanced pattern clustering
- automated official integrations where legitimately available
- mobile app

## 10. Explicitly out of scope for v1

- direct access to users' bank accounts
- automated movement or reversal of funds
- automated legal determinations
- guaranteed fund recovery
- public doxxing or public accusation feeds
- scraping private messaging platforms without authorization
- automatic filing through unofficial endpoints
- a broad social-network feed as the primary product

## 11. Success criteria for the first release

A reviewer should be able to demonstrate this end-to-end flow:

```text
Suspicious message
    ↓
Scam Check
    ↓
Explainable risk result
    ↓
Action recommendation
    ↓
Create case
    ↓
Attach evidence
    ↓
Generate factual incident summary
    ↓
Official reporting handoff
    ↓
Save official reference / case status
```

The entire flow should be testable, documented, and reproducible.
