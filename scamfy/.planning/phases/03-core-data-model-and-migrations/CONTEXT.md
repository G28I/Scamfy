# Phase 3: Core Data Model & Migrations — Context

- **Phase**: 03 - Core Data Model & Migrations
- **Milestone**: 0 (Foundation)
- **Status**: Planned ⚪
- **Requirements Covered**: `SEC-06`, `SEC-07`, `CASE-01..04`, `REP-01..03`

---

## Goal

Design and implement the complete PostgreSQL database schema, SQLAlchemy 2.0 declarative ORM models, Alembic migration pipeline, and asynchronous database session management for Scamfy. Provide automated migration verification and isolated test fixtures for local testing without external database dependencies.

---

## Scope & Core Deliverables

1. **Database Session & Connection Management**:
   - Asynchronous SQLAlchemy 2.0 engine (`create_async_engine`) and session factory (`async_sessionmaker`).
   - Support for both PostgreSQL (`postgresql+asyncpg://`) in production/staging and SQLite in-memory (`sqlite+aiosqlite:///:memory:`) for local unit and contract testing.
   - FastAPI dependency `get_db` providing scoped async database sessions with automatic rollback on unhandled exceptions.

2. **Core Relational Domain Models**:
   - **Users & Identities** (`users`): Clerk user ID mappings, user roles (`student_user`, `college_admin`, `moderator`), college affiliations.
   - **Scam Checks & Signals** (`scam_checks`): Analysis session records, raw input hash, overall risk rating (`SAFE`, `CAUTION`, `SUSPICIOUS`, `HIGH_RISK`, `CRITICAL`), primary/secondary categories, JSONB extracted entities and red flag signals, model metadata (`AI-04`).
   - **Scam Patterns & Community Intelligence** (`scam_patterns`, `community_reports`): Normalized indicators (UPI, phone, domain, handle), verification status (`UNVERIFIED`, `COMMUNITY_FLAGGED`, `MODERATOR_VERIFIED`, `DISMISSED`), aggregation counters (`REP-01..03`).
   - **Victim Cases & Evidence Timeline** (`victim_cases`, `case_timeline_events`, `case_evidence`): Case ownership (`user_id`), financial loss tracking, 1930 / official complaint acknowledgment numbers, chronological incident events, private evidence file records with checksums and magic-byte verification flags (`CASE-01..04`, `SEC-07`).
   - **Immutable Audit Trail** (`audit_events`): Append-only audit log capturing actor ID, actor role, action type, target resource, details payload, and timestamp (`SEC-06`).

3. **Alembic Migration Infrastructure**:
   - Structured `alembic.ini` and `backend/alembic/env.py` supporting async engine migrations.
   - Baseline migration revision (`0001_initial_schema.py`) generating all tables, foreign keys, unique constraints, and search indexes.

4. **Automated Testing & Model Verification**:
   - Pytest fixtures initializing async SQLite in-memory databases with full table schemas.
   - Unit tests validating model CRUD operations, foreign key cascades, JSONB serialization, enum constraints, and query indexes.
   - Migration integrity test validating schema creation against metadata.

5. **Strict Scope Fences**:
   - No frontend UI updates or product business logic (e.g. Nemotron inference, loan calculator logic, or live Clerk webhook handlers) are implemented in Phase 3.
   - Phase 3 is strictly dedicated to database schema, ORM models, migrations, and database session testing.

---

## Linked Requirements Traceability

- **`SEC-06`**: Immutable audit logs capturing moderator actions and sensitive state changes.
- **`SEC-07`**: Private evidence record model storing object keys, checksums, and MIME types for access control.
- **`CASE-01..04`**: Relational structure for victim cases, chronological timeline events, and evidence metadata.
- **`REP-01..03`**: Community report submissions linked to deduplicated scam pattern indicators.
- **`AI-04`**: Model metadata and prompt version preservation in check records.
