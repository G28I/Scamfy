# Scamfy — Architecture Principles

## 1. Architecture at a glance

```text
                           Scamfy Web
                 Next.js + TypeScript
                              │
                         HTTPS / JSON
                              │
                              ▼
                     FastAPI Application
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    Risk / Rules         Case / Evidence     Reporting Router
          │                   │                   │
          ▼                   ▼                   ▼
      AI Gateway          PostgreSQL        Official destinations
          │                   │
          ▼                   ├──────────────┐
 NVIDIA API / NIM             │              │
          │                   ▼              ▼
          ▼                Redis*       Cloudflare R2*
       Nemotron

* Introduced only when the demonstrated workload requires it.
```

## 2. Modular monolith first

Scamfy begins as one deployable FastAPI application with explicit internal modules, not as microservices.

Recommended application modules:

```text
app/
  api/
  auth/
  ai/
  scam_engine/
  risk_engine/
  reports/
  cases/
  evidence/
  reporting/
  moderation/
  sources/
  observability/
```

Separate services are justified only by a concrete scaling, reliability, security, or deployment boundary.

## 3. Frontend principles

- Next.js App Router + TypeScript.
- Feature-oriented folders rather than giant global component folders.
- Server/client boundaries must be explicit.
- Never put NVIDIA credentials or other secrets in browser code.
- Sensitive case data should be fetched only after server-side authorization.
- Use typed API contracts so UI code does not guess backend response shapes.

## 4. Backend principles

FastAPI is the trust boundary for all external AI, database, file-storage, and reporting operations.

Validate every request at the API boundary with Pydantic.

Keep business logic in domain modules rather than route handlers.

Side effects belong at the edges. Core risk calculations and transformations should remain testable and as pure as practical.

## 5. AI gateway

The frontend and core domain code must not call NVIDIA directly.

Use an internal abstraction such as:

```text
AI Gateway
  ├── analyze_message()
  ├── extract_entities()
  ├── summarize_case()
  └── explain_risk()
```

The gateway owns:

- provider authentication
- model selection
- timeouts
- retries where safe
- structured output validation
- model/version metadata
- error normalization
- observability

### Initial model direction

Use NVIDIA Nemotron through the NVIDIA API/NIM ecosystem. NVIDIA currently lists `nemotron-3.5-lightning-30b-a3b` as a fast Nemotron model with a free endpoint, and lists other Nemotron models for larger reasoning/long-context workloads. The exact production model slug should be verified at implementation time rather than hard-coded in this planning document. urlNVIDIA Nemotron model cataloghttps://build.nvidia.com/models?q=Nemotron

## 6. Rules + AI, not AI-only

The fraud decision path is layered:

```text
Input
  ↓
Normalization
  ↓
Entity extraction
  ↓
Deterministic rules
  ↓
Pattern matches
  ↓
Nemotron analysis
  ↓
Risk aggregation
  ↓
Action recommendation
```

Rules must produce inspectable signals.

AI must return structured, schema-validated output.

The final assessment must retain the evidence trail that supports it.

## 7. Risk model

Risk should be represented as a structured object, not just a number.

Example:

```json
{
  "level": "HIGH",
  "categories": ["fake_job", "money_mule"],
  "signals": [
    {"code": "MULE_PERSONAL_ACCOUNT", "severity": "high"},
    {"code": "FORWARD_FUNDS", "severity": "high"}
  ],
  "ai_assessment": {
    "confidence": 0.88,
    "uncertainty": ["sender identity not independently verified"]
  },
  "recommended_actions": [
    "do_not_forward_unexplained_funds",
    "preserve_evidence",
    "contact_official_channel"
  ]
}
```

This is an implementation shape, not a commitment to these exact field names.

## 8. Source provenance

Any external factual content used to route, verify, or explain should have provenance metadata:

```text
source_name
source_url
source_type
retrieved_at
last_verified_at
claim_scope
```

Do not silently merge official facts, community reports, model inferences, and Scamfy-generated pattern signals.

## 9. Official reporting gateway

The reporting layer should be configuration-driven rather than hard-coded through UI buttons.

```text
Incident classifier
      ↓
Routing table
      ↓
Official destination
      ↓
Verified URL/API capability
      ↓
User review
      ↓
Explicit consent
      ↓
Submit or deep-link
```

The Indian National Cyber Crime Reporting Portal currently provides online cybercrime reporting, financial-fraud guidance via 1930, complaint tracking, and suspect reporting functionality. urlNational Cyber Crime Reporting Portalhttps://www.cybercrime.gov.in/

The current I4C suspect-reporting page specifically lists suspicious website URLs, WhatsApp numbers, Telegram handles, phone numbers, email IDs, SMS identifiers, and social-media URLs as reportable inputs. urlI4C Report Suspecthttps://www.cybercrime.gov.in/Webform/cyber_suspect.aspx

Scamfy should treat those official destinations as external systems. Their current forms, policies, field requirements, and availability must be re-verified when implementation begins.

## 10. Evidence architecture

Relational database stores evidence metadata and relationships.

Object storage stores file bytes.

```text
Case
  ├── Evidence metadata ─────► PostgreSQL
  └── Object key ────────────► R2/S3
```

Evidence downloads must use authorization-controlled, time-limited access.

Never expose permanent object-storage URLs to the client.

## 11. Database principles

PostgreSQL is the system of record for:

- users
- cases
- reports
- indicators
- risk assessments
- official sources
- complaint references
- evidence metadata
- audit events

Prefer relational integrity and explicit foreign keys.

Do not store unstructured AI output blobs as the primary truth for domain data. Persist normalized facts separately.

## 12. Authentication and authorization

Use Clerk for identity/session management if that remains the selected auth provider at implementation time.

Authorization must still be implemented in the application domain. Authentication alone is not authorization.

Core roles:

- anonymous user
- authenticated user
- moderator
- administrator
- organization user (later)

A moderator must not automatically gain access to private victim evidence unless a documented permission model grants it.

## 13. Storage and queues

### PostgreSQL

Primary structured data store.

### Cloudflare R2 / S3

Private object storage for evidence once uploads are implemented.

### Redis

Introduce only for concrete needs such as rate limiting, short-lived caching, or background job queues. Do not make Redis a dependency for the first text-analysis slice if the slice can work without it.

## 14. Search and pattern matching

Start with PostgreSQL indexing/full-text capabilities and normalized identifiers.

Use a separate search engine only when scale or relevance requirements justify it.

Pattern detection should support:

- exact identifier matches
- normalized identifier matches
- fuzzy campaign similarity
- time-based clustering
- category overlap

## 15. Privacy architecture

Data classification should be explicit:

```text
PUBLIC
  ↓
AGGREGATE / PATTERN
  ↓
AUTHENTICATED PRIVATE
  ↓
SENSITIVE CASE DATA
  ↓
PRIVATE EVIDENCE
```

The further down the sensitivity ladder, the smaller the access surface.

Do not send sensitive case content to analytics providers unless strictly necessary and explicitly designed.

## 16. Security principles

- Fail fast on missing server-side secrets.
- Validate all external input.
- Rate-limit sensitive endpoints.
- Protect against prompt injection where untrusted content is passed to models or tools.
- Never trust model-generated URLs or integration instructions without validation.
- Keep SSRF protections in mind for URL analysis.
- Treat uploaded files as untrusted.
- Virus/malware scanning should be introduced before allowing arbitrary file processing at scale.
- Use secure headers and CSRF protections appropriate to the chosen auth/session architecture.
- Audit administrative changes.

## 17. Observability

Capture:

- request success/failure
- rule execution outcome
- AI provider latency
- model response validation failures
- case state changes
- reporting handoff outcomes

Do not capture unnecessary raw victim content in logs.

Use Sentry or an equivalent error-monitoring layer only with privacy-safe configuration.

## 18. Testing strategy

### Unit

- rule engine
- loan calculations
- risk aggregation
- data normalization
- report routing

### Integration

- PostgreSQL repositories
- NVIDIA gateway
- object storage
- authentication/authorization

### E2E

- scam check
- money-mule warning
- loan analysis
- create case
- upload evidence
- official reporting handoff

### AI evaluation

Maintain a curated evaluation set with:

- benign examples
- clear scam examples
- ambiguous examples
- adversarial examples
- money-mule examples
- loan-trap examples

Track false positives and false negatives separately. Do not optimize purely for one headline accuracy number.

## 19. Deployment principles

Initial deployment:

```text
Vercel
  └── Next.js

Railway / Render
  └── FastAPI

Managed PostgreSQL

Private object storage
```

The exact vendors can change without changing the core architecture.

## 20. Recruiter-facing traceability

Every meaningful technical decision should answer:

- What problem were we solving?
- What options were considered?
- What did we choose?
- Why?
- What evidence supported the decision?
- What changed after implementation?

GSD `.planning/` artifacts are the primary execution history. This foundation folder is the original product/architecture baseline from which that history evolves.
