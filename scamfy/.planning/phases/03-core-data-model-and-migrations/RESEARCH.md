# Phase 3: Core Data Model & Migrations — Research

## 1. Relational Architecture & Entity-Relationship Schema

Scamfy requires a robust PostgreSQL relational schema with typed columns for relational integrity, JSONB for genuinely variable structured payloads (signals, entities, telemetry), and structural privacy boundaries.

```mermaid
erDiagram
    USERS ||--o{ SCAM_CHECKS : "initiates (optional FK)"
    USERS ||--o{ COMMUNITY_REPORTS : "submits (reporter_user_id)"
    USERS ||--o{ VICTIM_CASES : "owns (user_id)"
    
    SCAM_PATTERNS ||--o{ COMMUNITY_REPORTS : "aggregates (pattern_id)"
    
    VICTIM_CASES ||--o{ CASE_TIMELINE_EVENTS : "contains (case_id)"
    VICTIM_CASES ||--o{ CASE_EVIDENCE : "attaches (case_id)"

    USERS {
        uuid id PK "Internal Scamfy UUID"
        string clerk_user_id UK "External Clerk Subject (Indexed)"
        string email "Nullable"
        string role "student_user | college_admin | moderator"
        string college_domain "Nullable"
        datetime created_at
        datetime updated_at
    }

    SCAM_CHECKS {
        uuid id PK
        uuid user_id FK "Nullable for anonymous analysis"
        string input_hash "SHA-256 preview"
        string overall_risk "SAFE | CAUTION | SUSPICIOUS | HIGH_RISK | CRITICAL"
        string primary_category "Taxonomy category"
        jsonb secondary_categories "JSONB array of secondary categories"
        jsonb signals "JSONB list of detected red-flag rules"
        jsonb extracted_entities "JSONB dict of extracted identifiers"
        jsonb model_metadata "JSONB inference telemetry (model, prompt version)"
        jsonb action_recommendations "JSONB list of approved advice"
        datetime created_at
    }

    SCAM_PATTERNS {
        uuid id PK
        string indicator_type "UPI_ID | PHONE | DOMAIN | HANDLE | BANK_ACC | SCRIPT"
        string indicator_value "Normalized & Indexed"
        string category "Taxonomy category"
        string risk_level "LOW | MEDIUM | HIGH | CRITICAL"
        string verification_status "UNVERIFIED | COMMUNITY_FLAGGED | MODERATOR_VERIFIED | DISMISSED"
        int report_count "Default 1"
        datetime first_reported_at
        datetime last_reported_at
        jsonb metadata_payload "Variable metadata attributes"
    }

    COMMUNITY_REPORTS {
        uuid id PK
        uuid reporter_user_id FK "References users.id (Non-nullable)"
        uuid pattern_id FK "References scam_patterns.id (Nullable)"
        string indicator_type "UPI_ID | PHONE | DOMAIN | HANDLE | BANK_ACC | SCRIPT"
        string indicator_value "Submitted indicator string"
        string category "Taxonomy category"
        text description "Report narrative"
        string status "PENDING | APPROVED | REJECTED | MERGED"
        text moderator_notes "Nullable triage notes"
        datetime created_at
        datetime updated_at
    }

    VICTIM_CASES {
        uuid id PK
        uuid user_id FK "References users.id (Non-nullable owner)"
        string title "Case title"
        string category "Taxonomy category"
        numeric financial_loss_amount "Numeric(12, 2) Nullable"
        string currency "Default 'INR'"
        string status "DRAFT | OPEN | OFFICIAL_REPORTED | RESOLVED | ARCHIVED"
        string official_complaint_ack_no "1930 / Cybercrime Ack No"
        datetime support_grant_expires_at "Moderator temporary access timestamp"
        datetime created_at
        datetime updated_at
    }

    CASE_TIMELINE_EVENTS {
        uuid id PK
        uuid case_id FK "References victim_cases.id (CASCADE)"
        datetime event_timestamp "Incident timestamp"
        string event_type "INITIAL_CONTACT | PAYMENT_SENT | PAYMENT_REQ | THREAT | POLICE_REPORT | NOTE"
        text description "Factual event description"
        numeric amount "Numeric(12, 2) Nullable"
        string counterparty_identifier "UPI/Handle/Account Nullable"
        datetime created_at
    }

    CASE_EVIDENCE {
        uuid id PK
        uuid case_id FK "References victim_cases.id (CASCADE)"
        string file_key UK "R2/S3 Object Key"
        string file_name "Sanitized original filename"
        bigint file_size_bytes "File size in bytes"
        string content_type "Validated MIME type"
        string sha256_checksum "SHA-256 digest"
        boolean magic_signature_verified "Magic byte confirmation"
        datetime created_at
    }

    AUDIT_EVENTS {
        uuid id PK
        string actor_id "Clerk ID or internal UUID of actor"
        string actor_role "student_user | college_admin | moderator | system"
        string action "MODERATE_REPORT | SUPPORT_ACCESS | VERIFY_PATTERN | etc."
        string target_resource_type "community_report | victim_case | etc."
        string target_resource_id "ID of affected resource"
        jsonb details "Sanitized context metadata (no raw secrets/PII)"
        string ip_address_hash "Hashed client IP"
        datetime created_at "Append-only timestamp"
    }
```

---

## 2. Core Architectural Principles & Boundaries

### 1. Clerk Identity Boundary
- Internal Scamfy models reference internal UUID primary keys (`users.id`).
- External Clerk user IDs (`clerk_user_id`) are stored as unique, indexed string columns on the `users` table.
- This decouples internal foreign keys from external authentication provider schemas while allowing fast O(1) user lookups on authentication tokens.

### 2. Privacy Boundary: ScamCheck vs CommunityReport
- **`scam_checks`**: Represents private, read-heavy analysis sessions of untrusted text. Accessible anonymously (`SEC-01`, `user_id` is nullable). Results and input text are never automatically published or exposed in community intelligence.
- **`community_reports`**: Represents an intentional, authenticated user submission to the public/moderated scam pattern database (`REP-01`). `reporter_user_id` is non-nullable. When verified by a moderator, reports link to `scam_patterns` (`pattern_id`).
- Keeping these tables distinct ensures that private victim queries never inadvertently leak into community threat feeds.

### 3. Structural Privacy Chain: User -> VictimCase -> Evidence
- Victim case ownership is strictly rooted in `users.id`:
  $$\text{users.id} \xrightarrow{\text{1:N}} \text{victim\_cases.id} \xrightarrow{\text{1:N}} \text{case\_evidence.id}$$
- `case_evidence` records reference `victim_cases.id` with `ondelete="CASCADE"`.
- Ownership verification is structurally guaranteed by traversing `evidence.case.user_id == authenticated_user.id`.
- Moderator access is governed by the explicit temporal grant field `support_grant_expires_at` on `victim_cases` (`SEC-07`).

### 4. Append-Only Audit Trail (`SEC-06`)
- `audit_events` is strictly append-only.
- No update or delete operations are exposed in the repository or ORM interface.
- Stores privacy-safe metadata only: operator identifier, role, action, target resource, hashed IP, and sanitized payload details (strictly excluding raw PII, plain financial credentials, or private file keys).

### 5. Proper JSONB Usage vs Relational Columns
- **JSONB is used only for variable structured payloads**:
  - `scam_checks.signals` (list of triggered red flags and confidence weights)
  - `scam_checks.extracted_entities` (dictionary of entity arrays: URLs, UPIs, phones, accounts)
  - `scam_checks.model_metadata` (telemetry: model slug, temperature, prompt version `AI-04`)
  - `scam_patterns.metadata_payload` (context-dependent pattern attributes)
  - `audit_events.details` (variable audit event context)
- **Typed Relational Columns are used for all core attributes**:
  - Primary/foreign keys (`UUID`), status enums (`Enum`/`String`), financial loss amounts (`Numeric(12, 2)`), timestamps (`DateTime(timezone=True)`), checksums (`String(64)`), file sizes (`BigInteger`), counts (`Integer`).

---

## 3. Database Driver, Testing Strategy & Migrations

### 1. Dedicated PostgreSQL Testing Environment
- Rather than in-memory SQLite (which lacks native `UUID`, `JSONB` operators, and dialect-specific constraints), tests will execute against a **temporary PostgreSQL test database** (configured via `TEST_DATABASE_URL` / Docker container `scamfy_test_db`).
- This guarantees that PostgreSQL-specific behaviors (JSONB indexing, native UUID validation, constraint enforcement, Alembic autogenerate comparisons) are accurately tested.

### 2. Alembic Async Engine Integration
- `alembic.ini` and `backend/alembic/env.py` configured with `asyncpg` async connection pooling (`run_migrations_online` invoking `connection.run_sync(do_run_migrations)`).
- Baseline migration `0001_initial_schema.py` defines all 8 core tables with full bidirectional `upgrade()` and `downgrade()` procedures.

---

## 4. Scope Fences & Anti-Patterns to Avoid

1. **No UI or Business Logic**: Keep all UI components, scoring heuristics, Nemotron AI inference clients, Cloudflare R2 clients, and 1930 reporting integrations out of Phase 3.
2. **No Extra Domain Entities**: Do not add speculative domain models outside of the 8 core entities required by the requirements baseline.
