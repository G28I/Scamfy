# Phase 3: Core Data Model & Migrations — Plan

- **Phase**: 03
- **Milestone**: 0 (Foundation)
- **Status**: Complete ✅
- **Goal**: Implement the complete asynchronous PostgreSQL database layer with SQLAlchemy 2.0 ORM models, Alembic migration engine, session management, and comprehensive model test suites against a dedicated PostgreSQL test database.
- **Requirements Covered**: `SEC-06`, `SEC-07`, `CASE-01..04`, `REP-01..03`, `AI-04`
- **Scope Fences**: No frontend UI changes, product domain business logic (scoring/rules/Nemotron), R2 storage client, or 1930 official gateway integrations are implemented in this phase. (PostgreSQL schema, models, migrations & tests only).

---

## Detailed Task Breakdown

### Task 1: Database Engine, Async Session Management & Base Classes
- **Action**:
  - Update `backend/requirements.txt` to include `asyncpg>=0.30.0` and `alembic>=1.14.0`.
  - Create `backend/app/core/database.py`:
    - Async engine creation (`create_async_engine`) using `settings.DATABASE_URL` (with `postgresql+asyncpg://` driver).
    - Async session factory (`async_sessionmaker[AsyncSession]`, `expire_on_commit=False`).
    - FastAPI dependency `get_db()` yielding scoped async database sessions with auto-rollback on exception.
  - Create `backend/app/models/base.py`:
    - Shared `Base(DeclarativeBase)` class.
    - Standardized `TimestampMixin` (`created_at`, `updated_at` with timezone-aware `DateTime(timezone=True)`).
    - `UUIDMixin` (primary key `UUID(as_uuid=True)` with `uuid.uuid4` default).
- **Verification**: Import database and base modules; ensure `Base.metadata` initializes cleanly.

### Task 2: SQLAlchemy 2.0 Declarative Domain Models
- **Action**:
  - Create `backend/app/models/user.py`:
    - `User`: Internal primary key `id` (`UUID`), external `clerk_user_id` (`String(128)`, unique, indexed), `email`, `role` (`student_user`, `college_admin`, `moderator`), `college_domain`.
  - Create `backend/app/models/scam_check.py`:
    - `ScamCheck`: Private/anonymous analysis record (`SEC-01`). `id` (`UUID`), `user_id` (nullable FK to `users.id`), `input_hash` (`String(64)`), `overall_risk` (`String(32)`), `primary_category` (`String(64)`), `secondary_categories` (`JSONB`), `signals` (`JSONB`), `extracted_entities` (`JSONB`), `model_metadata` (`JSONB` `AI-04`), `action_recommendations` (`JSONB`).
  - Create `backend/app/models/scam_pattern.py` & `backend/app/models/community_report.py`:
    - `ScamPattern`: Public/moderated indicator directory (`REP-01..03`). `id` (`UUID`), `indicator_type` (`String(32)`), `indicator_value` (`String(512)`), `category` (`String(64)`), `risk_level` (`String(32)`), `verification_status` (`String(32)`), `report_count` (`Integer`, default 1), `first_reported_at`, `last_reported_at`, `metadata_payload` (`JSONB`), and composite unique constraint on `(indicator_type, indicator_value)` (`REP-03`).
    - `CommunityReport`: Authenticated community submission. `id` (`UUID`), `reporter_user_id` (FK to `users.id`, non-nullable), `pattern_id` (nullable FK to `scam_patterns.id`), `indicator_type` (`String(32)`), `indicator_value` (`String(512)`), `category` (`String(64)`), `description` (`Text`), `status` (`String(32)`: `PENDING`, `APPROVED`, `REJECTED`, `MERGED`), `moderator_notes` (`Text`).
  - Create `backend/app/models/victim_case.py`:
    - `VictimCase`: `id` (`UUID`), `user_id` (FK to `users.id`, non-nullable owner), `title` (`String(255)`), `category` (`String(64)`), `financial_loss_amount` (`Numeric(12, 2)` nullable), `currency` (`String(3)`, default `'INR'`), `status` (`String(32)`: `DRAFT`, `OPEN`, `OFFICIAL_REPORTED`, `RESOLVED`, `ARCHIVED`), `official_complaint_ack_no` (`String(64)`).
    - `CaseTimelineEvent`: `id` (`UUID`), `case_id` (FK to `victim_cases.id`, `ondelete="CASCADE"`), `event_timestamp` (`DateTime(timezone=True)`), `event_type` (`String(64)`), `description` (`Text`), `amount` (`Numeric(12, 2)`), `counterparty_identifier` (`String(255)`).
    - `CaseEvidence`: `id` (`UUID`), `case_id` (FK to `victim_cases.id`, `ondelete="CASCADE"`), `file_key` (`String(512)`, unique), `file_name` (`String(255)`), `file_size_bytes` (`BigInteger`), `content_type` (`String(128)`), `sha256_checksum` (`String(64)`), `magic_signature_verified` (`Boolean`).
    - `CaseSupportGrant` (`SEC-07`): Explicit, time-bounded user authorization for moderator access. `id` (`UUID`), `case_id` (FK to `victim_cases.id`, `ondelete="CASCADE"`), `granted_by_user_id` (FK to `users.id`), `grantee_user_id` (FK to `users.id`), `expires_at` (`DateTime(timezone=True)`), `revoked_at` (`DateTime(timezone=True)` nullable), `rationale` (`String(255)` nullable).
  - Create `backend/app/models/audit_event.py` (`SEC-06`):
    - `AuditEvent`: Append-only audit record protected by PostgreSQL DB triggers and ORM event hooks. `id` (`UUID`), `actor_id` (`String(128)`), `actor_role` (`String(32)`), `action` (`String(64)`), `target_resource_type` (`String(64)`), `target_resource_id` (`String(128)`), `details` (`JSONB` sanitized context metadata without raw secrets/PII), `ip_address_hash` (`String(64)`), `created_at` (`DateTime(timezone=True)`).
  - Export all 9 models in `backend/app/models/__init__.py`.
- **Verification**: Verify all models import and validate against SQLAlchemy Declarative mapping without errors.

### Task 3: Alembic Async Migration Pipeline & Initial Migration
- **Action**:
  - Initialize Alembic environment in `backend/alembic/` and `backend/alembic.ini`.
  - Configure `backend/alembic/env.py` for async SQLAlchemy engine (`asyncpg`) and dynamic `settings.DATABASE_URL` binding.
  - Generate baseline migration `0001_initial_schema.py` creating all tables, indexes, unique constraints, foreign key cascades, and append-only triggers with bidirectional `upgrade()` and `downgrade()`.
- **Verification**: Run `alembic check` / test applying migration upgrade and downgrade on PostgreSQL test database.

### Task 4: PostgreSQL Pytest Fixtures & Model Test Suite
- **Action**:
  - Configure `backend/tests/conftest.py` with async PostgreSQL test database engine (`TEST_DATABASE_URL`, e.g. `postgresql+asyncpg://postgres:postgres@localhost:5432/scamfy_test`) with `NullPool`.
  - Create `backend/tests/test_models.py`:
    - Test User creation, role assignment, and unique `clerk_user_id` constraint.
    - Test ScamCheck creation with JSONB signals and entity payloads.
    - Test ScamPattern and CommunityReport linkage, and ScamPattern composite unique constraint `(indicator_type, indicator_value)` (`REP-03`).
    - Test VictimCase, CaseTimelineEvent, CaseEvidence, and CaseSupportGrant ownership chain (`User -> VictimCase -> Evidence / Grants`), explicit revocation, and cascade deletes (`SEC-07`).
    - Test AuditEvent append-only creation, indexed lookups, and ensure UPDATE/DELETE operations are blocked at both ORM and database trigger boundaries (`SEC-06`).
    - Test live Alembic migration `upgrade("head")` and `downgrade("base")` roundtrip cycles.
- **Verification**: Execute `pytest backend/tests` ensuring all database model and fixture tests pass against PostgreSQL.

---

## Canonical Verification Gates (Definition of Done)

| Gate | Verification Command | Passing Criteria |
| :--- | :--- | :--- |
| **Gate 1: Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors (`tsc --noEmit`). |
| **Gate 2: Frontend Linting** | `npm run lint` | Zero ESLint warnings or errors (`eslint .`). |
| **Gate 3: Frontend Unit Tests** | `npm run test:run` | All Vitest component/utility tests pass. |
| **Gate 4: Backend Lint & Format** | `ruff check backend/`<br>`ruff format --check backend/` | Zero Python lint issues and all files formatted per Ruff rules. |
| **Gate 5: Backend Pytest Suite** | `pytest backend/tests` | All PostgreSQL database model CRUD, foreign key, JSONB, and fixture tests pass. |
| **Canonical Local Suite** | `scripts/verify.ps1` (Win)<br>`scripts/verify.sh` (POSIX) | Full 5-gate pipeline passes in a single command. |
| **Migration Integrity** | `alembic upgrade head`<br>`alembic downgrade base` | Initial Alembic migration applies and rolls back cleanly against PostgreSQL test database. |
| **Planning Trail** | `VERIFICATION.md`<br>`SUMMARY.md` | Audit trail and phase summary recorded in `.planning/`. |
