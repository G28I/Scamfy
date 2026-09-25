# Phase 3: Core Data Model & Migrations — Context

- **Phase**: 03 - Core Data Model & Migrations
- **Milestone**: 0 (Foundation)
- **Status**: Ready for Execution ⚪
- **Requirements Covered**: `SEC-06`, `SEC-07`, `CASE-01..04`, `REP-01..03`, `AI-04`
- **Architecture Baseline**: [ADR 0001: Prisma ORM for Domain Persistence and FastAPI as Stateless AI Boundary](../../../docs/adr/0001-prisma-domain-persistence-and-fastapi-ai-boundary.md)

---

## Goal

Implement the complete PostgreSQL database schema, Prisma ORM schema (`schema.prisma`), Prisma migrations (`prisma migrate`), singleton Prisma Client, and integration test suite for Scamfy. Validate all schema migrations, PostgreSQL-specific UUID/JSONB features, composite unique constraints, relational cascades, and append-only audit protections using a dedicated PostgreSQL test database environment.

---

## Architecture Decisions & Scope Boundaries (ADR 0001)

1. **Prisma ORM as Application Persistence Authority**:
   - The Next.js server / Backend-for-Frontend (BFF) owns all database operations, transactional boundaries, and domain persistence using **Prisma ORM** (`prisma`, `@prisma/client`, `prisma migrate`).
   - The PostgreSQL database schema is defined authoritatively in `prisma/schema.prisma`.
   - Database migrations are generated, version-controlled, and applied exclusively via `prisma migrate`.
   - Prisma Client generates strictly-typed TypeScript interfaces utilized across Next.js Server Components, Server Actions, and Route Handlers.

2. **Stateless FastAPI AI Service Boundary**:
   - FastAPI is strictly dedicated to AI inference (NVIDIA Nemotron 70B), deterministic rule heuristics, and NLP extraction.
   - FastAPI communicates with Next.js via stateless HTTP/JSON contracts.
   - FastAPI does **not** directly connect to, query, or mutate the Scamfy PostgreSQL domain tables (no SQLAlchemy or Alembic for domain persistence).

3. **Core Relational Domain Entities & Invariants**:
   - **`User`**: Internal primary key `id` (`UUID`), external `clerkUserId` (`String`, `@unique`, indexed), `email`, `role` (`student_user`, `college_admin`, `moderator`), `collegeDomain`. All internal foreign keys reference internal `User.id`.
   - **`ScamCheck`**: Private/anonymous analysis record (`SEC-01`). Stores `userId` (nullable FK to `User.id`), `inputHash`, `overallRisk`, `primaryCategory`, `secondaryCategories` (Json), `signals` (Json), `extractedEntities` (Json), `modelMetadata` (Json `AI-04`), and `actionRecommendations` (Json). Completely isolated from public feeds.
   - **`ScamPattern`**: Public/moderated indicator directory (`REP-01..03`). Normalized indicator attributes, `category`, `riskLevel`, `verificationStatus`, `reportCount`, `metadataPayload` (Json), and composite unique constraint on `@@unique([indicatorType, indicatorValue])` for deduplication (`REP-03`).
   - **`CommunityReport`**: Authenticated community submission. `reporterUserId` (FK to `User.id`, non-nullable), `patternId` (nullable FK to `ScamPattern.id`), indicator fields, `description`, `status` (`PENDING`, `APPROVED`, `REJECTED`, `MERGED`), and `moderatorNotes`.
   - **`VictimCase`**: Private incident case record (`userId` FK to `User.id`, non-nullable owner), `title`, `category`, `financialLossAmount` (`Decimal(12, 2)`), `currency`, `status`, `officialComplaintAckNo`.
   - **`CaseTimelineEvent`**: Chronological event (`caseId` FK with cascade delete, `eventTimestamp`, `eventType`, `description`, `amount`, `counterpartyIdentifier`).
   - **`CaseEvidence`**: Private evidence artifact (`caseId` FK with cascade delete, `fileKey` unique, `fileName`, `fileSizeBytes`, `contentType`, `sha256Checksum`, `magicSignatureVerified`). Enforces structural ownership via `case.userId` (`SEC-07`, `CASE-01..04`).
   - **`CaseSupportGrant`**: Explicit, time-bounded user authorization for moderator access (`caseId` FK cascade, `grantedByUserId` FK to `User.id`, `granteeUserId` FK to `User.id`, `expiresAt`, `revokedAt`, `rationale`) (`SEC-07`).
   - **`AuditEvent` (`SEC-06`)**: Append-only security audit log (`actorId`, `actorRole`, `action`, `targetResourceType`, `targetResourceId`, `details` sanitized Json, `ipAddressHash`, `createdAt`). Protected by PostgreSQL trigger (`trg_audit_events_prevent_mutation`) and Prisma Client extension preventing `update` and `delete` operations.

4. **Principled JSONB Strategy**:
   - JSONB is used exclusively for genuinely variable structured payloads (red-flag signals, extracted entity dictionaries, inference telemetry, pattern metadata, sanitized audit context).
   - Core relational attributes (keys, enums, amounts, timestamps, checksums, statuses) remain strictly typed relational columns.

5. **Automated Testing Strategy**:
   - Integration tests execute against a real PostgreSQL test database (`TEST_DATABASE_URL`).
   - Vitest test suite (`lib/prisma.test.ts`) verifies model CRUD, Clerk identity boundary, JSONB serialization, composite uniqueness deduplication, cascading deletes, and append-only trigger enforcement.

6. **Strict Scope Fences**:
   - No frontend UI updates.
   - No product business logic (scoring rules, Nemotron inference client).
   - No Cloudflare R2 object storage clients.
   - No 1930 external reporting gateway clients.
