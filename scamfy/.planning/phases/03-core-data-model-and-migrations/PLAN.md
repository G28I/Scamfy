# Phase 3: Core Data Model & Migrations — Plan

- **Phase**: 03
- **Milestone**: 0 (Foundation)
- **Status**: Ready for Execution ⚪
- **Goal**: Implement the complete asynchronous PostgreSQL database layer with SQLAlchemy 2.0 ORM models, Alembic migration engine, session management, and comprehensive model test suites.
- **Requirements Covered**: `SEC-06`, `SEC-07`, `CASE-01..04`, `REP-01..03`
- **Scope Fences**: No frontend UI changes or Scamfy product domain business logic are implemented in this phase. (Database schema & migrations only).

---

## Detailed Task Breakdown

### Task 1: Database Engine, Async Session Management & Base Classes
- **Action**:
  - Add `aiosqlite>=0.20.0` and `alembic>=1.14.0` (and `asyncpg>=0.30.0`) to `backend/requirements.txt`.
  - Create `backend/app/core/database.py`:
    - Async engine creation (`create_async_engine`) using `settings.DATABASE_URL`.
    - Async session factory (`async_sessionmaker[AsyncSession]`).
    - FastAPI dependency `get_db()` yielding scoped async database sessions with auto-rollback on exception.
  - Create `backend/app/models/base.py`:
    - Shared `Base(DeclarativeBase)` class.
    - `TimestampMixin` (`created_at`, `updated_at` with timezone awareness).
    - `UUIDMixin` (primary key UUIDv4).
- **Verification**: Import database and base modules; ensure `Base.metadata` initializes cleanly.

### Task 2: SQLAlchemy 2.0 Declarative Domain Models
- **Action**:
  - Create `backend/app/models/user.py`:
    - `User`: `id`, `clerk_user_id` (unique index), `email`, `role` (`student_user`, `college_admin`, `moderator`), `college_domain`.
  - Create `backend/app/models/scam_check.py`:
    - `ScamCheck`: `id`, `user_id` (nullable FK), `input_hash`, `overall_risk`, `primary_category`, `secondary_categories` (JSON), `signals` (JSON), `extracted_entities` (JSON), `model_metadata` (JSON), `action_recommendations` (JSON).
  - Create `backend/app/models/scam_pattern.py` and `backend/app/models/community_report.py`:
    - `ScamPattern`: `id`, `indicator_type`, `indicator_value` (indexed), `category`, `risk_level`, `verification_status`, `report_count`, `first_reported_at`, `last_reported_at`, `metadata_payload` (JSON).
    - `CommunityReport`: `id`, `reporter_user_id` (FK), `pattern_id` (nullable FK), `indicator_type`, `indicator_value`, `category`, `description`, `status`, `moderator_notes`.
  - Create `backend/app/models/victim_case.py`:
    - `VictimCase`: `id`, `user_id` (indexed), `title`, `category`, `financial_loss_amount`, `currency`, `status`, `official_complaint_ack_no`, `support_grant_expires_at`.
    - `CaseTimelineEvent`: `id`, `case_id` (FK cascade), `event_timestamp`, `event_type`, `description`, `amount`, `counterparty_identifier`.
    - `CaseEvidence`: `id`, `case_id` (FK cascade), `file_key` (unique), `file_name`, `file_size_bytes`, `content_type`, `sha256_checksum`, `magic_signature_verified`.
  - Create `backend/app/models/audit_event.py` (`SEC-06`):
    - `AuditEvent`: `id`, `actor_id`, `actor_role`, `action`, `target_resource_type`, `target_resource_id`, `details` (JSON), `ip_address_hash`.
  - Export all models in `backend/app/models/__init__.py`.
- **Verification**: Verify all models can be mapped by SQLAlchemy without relationship or column definition errors.

### Task 3: Alembic Migration Pipeline & Initial Migration
- **Action**:
  - Initialize Alembic environment in `backend/alembic/` and `backend/alembic.ini`.
  - Configure `backend/alembic/env.py` for async SQLAlchemy engine and bind to `Base.metadata`.
  - Generate baseline migration `0001_initial_schema.py` creating all 8 tables, indexes, unique constraints, and foreign key relationships.
- **Verification**: Run `alembic check` / verify migration script syntax and schema consistency.

### Task 4: Pytest Database Fixtures & Model Test Suite
- **Action**:
  - Create `backend/tests/conftest.py` providing async SQLite test engine (`sqlite+aiosqlite:///:memory:`) and `db_session` fixture that auto-creates all tables per test.
  - Create `backend/tests/test_models.py`:
    - Test User creation, role assignment, and unique Clerk ID constraint.
    - Test ScamCheck creation with JSON signals and entity payloads.
    - Test ScamPattern and CommunityReport linkage and cascading.
    - Test VictimCase, CaseTimelineEvent, and CaseEvidence relationship cascades and UUID validations.
    - Test AuditEvent immutable creation and query indexing.
- **Verification**: Execute `pytest backend/tests` ensuring all database model and fixture tests pass.

---

## Canonical Verification Gates (Definition of Done)

| Gate | Verification Command | Passing Criteria |
| :--- | :--- | :--- |
| **Gate 1: Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors (`tsc --noEmit`). |
| **Gate 2: Frontend Linting** | `npm run lint` | Zero ESLint warnings or errors (`eslint .`). |
| **Gate 3: Frontend Unit Tests** | `npm run test:run` | All Vitest component/utility tests pass. |
| **Gate 4: Backend Lint & Format** | `ruff check backend/`<br>`ruff format --check backend/` | Zero Python lint issues and all files formatted per Ruff rules. |
| **Gate 5: Backend Pytest Suite** | `pytest backend/tests` | All database model CRUD, foreign key, and fixture tests pass cleanly. |
| **Canonical Local Suite** | `scripts/verify.ps1` (Win)<br>`scripts/verify.sh` (POSIX) | Full 5-gate pipeline passes in a single command. |
| **Migration Integrity** | Schema verification | Initial Alembic migration generates all 8 core tables with downgrade support. |
| **Planning Trail** | `VERIFICATION.md`<br>`SUMMARY.md` | Audit trail and phase summary recorded in `.planning/`. |
