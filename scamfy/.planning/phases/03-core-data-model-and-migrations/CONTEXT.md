# Phase 3: Core Data Model & Migrations — Context

- **Phase**: 03 - Core Data Model & Migrations
- **Milestone**: 0 (Foundation)
- **Status**: Planned ⚪
- **Requirements Covered**: `SEC-06`, `SEC-07`, `CASE-01..04`, `REP-01..03`, `AI-04`

---

## Goal

Design and implement the complete PostgreSQL database schema, SQLAlchemy 2.0 declarative ORM models, Alembic migration pipeline, and asynchronous database session management for Scamfy. Validate all schema migrations, PostgreSQL-specific UUID/JSONB features, constraints, and relational cascades using a dedicated PostgreSQL test database environment.

---

## Scope & Core Deliverables

1. **Database Session & Connection Management**:
   - Asynchronous SQLAlchemy 2.0 engine (`create_async_engine`) and session factory (`async_sessionmaker[AsyncSession]`) targeting PostgreSQL (`postgresql+asyncpg://`).
   - FastAPI dependency `get_db` providing scoped async database sessions with automatic rollback on unhandled exceptions.
   - Dedicated PostgreSQL test database configuration (`TEST_DATABASE_URL` / Docker test instance) ensuring native PostgreSQL `UUID`, `JSONB`, enums, and constraint behaviors are fully validated in Pytest suites.

2. **Clerk Identity Boundary & Core Relational Models**:
   - **Users & Identities (`users`)**:
     - Internal Scamfy primary key: `id` (`UUID` PK).
     - External Clerk identity: `clerk_user_id` (`String(128)`, unique, indexed).
     - RBAC roles (`student_user`, `college_admin`, `moderator`), optional institutional affiliation (`college_domain`), and email.
     - All internal Scamfy foreign keys reference the internal `users.id` (UUID).
   - **Scam Checks vs Community Reports (Strict Privacy Boundary)**:
     - **`scam_checks`**: Private/anonymous analysis sessions (`SEC-01`). Stores `user_id` (nullable FK to `users.id` for anonymous checks), `input_hash`, `overall_risk`, `primary_category`, `secondary_categories` (JSONB array), `signals` (JSONB red-flag list), `extracted_entities` (JSONB dict), and `model_metadata` (JSONB telemetry `AI-04`). Completely isolated from public views.
     - **`community_reports`**: Intentional public/moderated submissions (`REP-01..03`). Requires authenticated reporter (`reporter_user_id` FK to `users.id`, non-nullable). Links to `scam_patterns` when reviewed/aggregated.
     - **`scam_patterns`**: Normalized, deduplicated indicator directory (`indicator_type`, `indicator_value` indexed, `category`, `risk_level`, `verification_status`, `report_count`, `metadata_payload` JSONB).
   - **Victim Case Center & Evidence Privacy Chain (`User -> VictimCase -> Evidence`)**:
     - **`victim_cases`**: Bound to owner (`user_id` FK to `users.id`, non-nullable), `title`, `category`, `financial_loss_amount` (`Numeric(12, 2)`), `currency`, `status`, `official_complaint_ack_no`, and `support_grant_expires_at` (`DateTime(timezone=True)`).
     - **`case_timeline_events`**: Chronological events (`case_id` FK cascade, `event_timestamp`, `event_type`, `description`, `amount`, `counterparty_identifier`).
     - **`case_evidence`**: Private victim files (`case_id` FK cascade, `file_key` unique, `file_name`, `file_size_bytes`, `content_type`, `sha256_checksum`, `magic_signature_verified`). Enforces structural ownership through `case.user_id` (`SEC-07`, `CASE-01..04`).
   - **Immutable Audit Trail (`audit_events` — `SEC-06`)**:
     - Append-only model (no update or delete operations).
     - Captures `id` (UUID PK), `actor_id` (string/UUID), `actor_role`, `action`, `target_resource_type`, `target_resource_id`, `details` (JSONB sanitized metadata without PII/secrets), `ip_address_hash`, and `created_at`.

3. **JSONB Strategy**:
   - JSONB is used exclusively for genuinely variable structured data (red-flag signal lists, extracted entity collections, inference metadata, pattern payloads, audit context).
   - All core entity attributes (enums, timestamps, monetary amounts, checksums, status flags, counts) remain strictly typed relational columns.

4. **Alembic Migration Infrastructure**:
   - Structured `alembic.ini` and `backend/alembic/env.py` supporting async engine migrations.
   - Baseline migration revision (`0001_initial_schema.py`) generating all 8 tables, foreign keys, unique constraints, and search indexes with bidirectional `upgrade()` and `downgrade()`.

5. **Automated Testing & Model Verification**:
   - Pytest fixtures initializing async PostgreSQL test sessions (`TEST_DATABASE_URL` with fallback to isolated test schema/DB).
   - Unit tests validating model CRUD, foreign key cascades, JSONB serialization, enum constraints, index definitions, and append-only audit semantics.

6. **Strict Scope Fences**:
   - No frontend UI updates.
   - No product business logic (rules engine, scoring, Nemotron inference client).
   - No Cloudflare R2 / S3 object storage upload pipelines.
   - No 1930 / external official gateway client implementations.
   - No extra domain entities beyond the 8 required for core requirements.

---

## Linked Requirements Traceability

- **`SEC-06`**: Immutable audit logs capturing moderator actions and sensitive state changes.
- **`SEC-07`**: Structurally enforceable victim evidence privacy chain and metadata.
- **`CASE-01..04`**: Relational structure for victim cases, chronological timelines, and evidence metadata.
- **`REP-01..03`**: Authenticated community reports linked to deduplicated scam patterns.
- **`AI-04`**: Model metadata and prompt version preservation in check records.
