# Phase 3: Core Data Model & Migrations — Research

## 1. Relational Architecture & Entity-Relationship Schema

Scamfy requires a robust relational foundation that supports structured search, JSONB payload flexibility for AI signals, and strict relational integrity for victim evidence and community reports.

```mermaid
erDiagram
    USERS ||--o{ SCAM_CHECKS : "initiates"
    USERS ||--o{ COMMUNITY_REPORTS : "submits"
    USERS ||--o{ VICTIM_CASES : "owns"
    USERS ||--o{ AUDIT_EVENTS : "performs"
    
    SCAM_PATTERNS ||--o{ COMMUNITY_REPORTS : "aggregates"
    
    VICTIM_CASES ||--o{ CASE_TIMELINE_EVENTS : "contains"
    VICTIM_CASES ||--o{ CASE_EVIDENCE : "attaches"

    USERS {
        uuid id PK
        string clerk_user_id UK
        string email
        string role "student_user | college_admin | moderator"
        string college_domain
        datetime created_at
        datetime updated_at
    }

    SCAM_CHECKS {
        uuid id PK
        uuid user_id FK "nullable for anonymous"
        string input_hash
        string overall_risk "SAFE | CAUTION | SUSPICIOUS | HIGH_RISK | CRITICAL"
        string primary_category
        jsonb secondary_categories
        jsonb signals
        jsonb extracted_entities
        jsonb model_metadata
        jsonb action_recommendations
        datetime created_at
    }

    SCAM_PATTERNS {
        uuid id PK
        string indicator_type "UPI_ID | PHONE | DOMAIN | HANDLE | BANK_ACC | SCRIPT"
        string indicator_value "normalized, indexed"
        string category
        string risk_level
        string verification_status "UNVERIFIED | COMMUNITY_FLAGGED | MODERATOR_VERIFIED | DISMISSED"
        int report_count
        datetime first_reported_at
        datetime last_reported_at
        jsonb metadata_payload
    }

    COMMUNITY_REPORTS {
        uuid id PK
        uuid reporter_user_id FK
        uuid pattern_id FK "nullable"
        string indicator_type
        string indicator_value
        string category
        text description
        string status "PENDING | APPROVED | REJECTED | MERGED"
        text moderator_notes
        datetime created_at
        datetime updated_at
    }

    VICTIM_CASES {
        uuid id PK
        string user_id "clerk_id index"
        string title
        string category
        numeric financial_loss_amount
        string currency
        string status "DRAFT | OPEN | OFFICIAL_REPORTED | RESOLVED | ARCHIVED"
        string official_complaint_ack_no
        datetime support_grant_expires_at
        datetime created_at
        datetime updated_at
    }

    CASE_TIMELINE_EVENTS {
        uuid id PK
        uuid case_id FK
        datetime event_timestamp
        string event_type "INITIAL_CONTACT | PAYMENT_SENT | PAYMENT_REQ | THREAT | POLICE_REPORT | NOTE"
        text description
        numeric amount
        string counterparty_identifier
        datetime created_at
    }

    CASE_EVIDENCE {
        uuid id PK
        uuid case_id FK
        string file_key UK
        string file_name
        bigint file_size_bytes
        string content_type
        string sha256_checksum
        boolean magic_signature_verified
        datetime created_at
    }

    AUDIT_EVENTS {
        uuid id PK
        string actor_id
        string actor_role
        string action
        string target_resource_type
        string target_resource_id
        jsonb details
        string ip_address_hash
        datetime created_at
    }
```

---

## 2. Technical Decisions & Patterns

### 1. SQLAlchemy 2.0 Modern Declarative Mappings
- Use `Mapped[...]` and `mapped_column(...)` for full static typing with mypy and IDE autocompletion.
- Define a shared `Base(DeclarativeBase)` base class in `backend/app/models/base.py`.
- Implement a `TimestampMixin` for standardized `created_at` and `updated_at` timezone-aware timestamps.

### 2. Primary Keys & UUID Strategy
- Use UUIDv4 (`uuid.uuid4`) primary keys across all tables to prevent sequential ID guessing and enable client-side UUID generation when needed.
- Represent UUIDs cleanly in SQLAlchemy (`UUID(as_uuid=True)`).

### 3. Database Driver & Test Portability
- **Production / Staging**: `asyncpg` driver (`postgresql+asyncpg://user:pass@host:5432/dbname`).
- **Local Testing**: `aiosqlite` driver (`sqlite+aiosqlite:///:memory:`).
- SQLite dialect considerations:
  - JSON / JSONB columns map transparently to JSON strings in SQLite via SQLAlchemy generic `JSON` or `JSONB().with_variant(JSON(), "sqlite")`.
  - UUID columns map to strings/native UUIDs seamlessly.

### 4. Alembic Async Migration Architecture
- Configure `alembic.ini` and `backend/alembic/env.py` using `run_migrations_online()` with `asyncio.run()` and `connection.run_sync(do_run_migrations)`.
- Centralize all model imports in `backend/app/models/__init__.py` so Alembic `target_metadata = Base.metadata` discovers every table schema automatically.

---

## 3. Scope Fences & Anti-Patterns to Avoid

1. **No Application Business Logic**: Do not implement scoring algorithms, Nemotron NIM clients, or Clerk webhook dispatchers in Phase 3.
2. **No Raw SQL Migrations Without Downgrade**: Ensure every Alembic migration has both `upgrade()` and `downgrade()` functions.
3. **No Unindexed High-Cardinality Queries**: Ensure `indicator_value` on `scam_patterns`, `user_id` on `victim_cases`, and `clerk_user_id` on `users` have appropriate database indexes.
