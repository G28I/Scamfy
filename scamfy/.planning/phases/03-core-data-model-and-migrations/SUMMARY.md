# Phase 3 Summary: Core Data Model & Migrations (Prisma on PostgreSQL)

- **Phase**: 03
- **Milestone**: 0 (Foundation)
- **Status**: Complete ✅
- **Completed Date**: 2026-09-25

---

## Executive Summary

Phase 3 delivered the authoritative relational database foundation for Scamfy using **Prisma ORM** (`@prisma/client`, `prisma` v6.19.3) against PostgreSQL (`localhost:5432`), operating in alignment with **ADR 0001** (`docs/adr/0001-prisma-domain-persistence-and-fastapi-ai-boundary.md`). It established all 9 core domain models (`User`, `ScamCheck`, `ScamPattern`, `CommunityReport`, `VictimCase`, `CaseTimelineEvent`, `CaseEvidence`, `CaseSupportGrant`, and `AuditEvent`), explicit Clerk authentication identity boundaries (`users.id` vs `users.clerk_user_id`), structural privacy chains for victim cases and evidence files (`users` -> `victim_cases` -> `case_evidence` / `case_support_grants`), clear privacy separation between private/anonymous scam checks and public community reports, an append-only audit logging architecture (`audit_events` `SEC-06`) enforced by both Prisma client runtime extensions and PostgreSQL triggers (`trg_audit_events_prevent_mutation`), composite indicator deduplication (`REP-03`), and a comprehensive Vitest PostgreSQL integration test suite.

FastAPI is strictly maintained as a stateless AI/NLP service boundary for Nemotron 70B and regex heuristics, with zero direct domain database persistence or mutation authority. Old SQLAlchemy models, Alembic migrations, and SQLAlchemy database sessions have been completely removed from the backend.

---

## Key Deliverables Completed

### 1. Prisma ORM Infrastructure & Architecture Decision
- **ADR 0001**: Authored and committed `docs/adr/0001-prisma-domain-persistence-and-fastapi-ai-boundary.md` establishing Prisma in Next.js Server/BFF as the sole database ORM and migration authority.
- **Singleton Client & Append-Only Extension**: Authored `scamfy/lib/prisma.ts` with global hot-reload development guards and an append-only runtime extension blocking `update` and `delete` operations on `auditEvent`.
- **Environment Configuration**: Configured `DATABASE_URL` in `scamfy/.env` and `scamfy/.env.example`.

### 2. Prisma Relational Domain Models (`prisma/schema.prisma` — 9 Core Entities)
- **`User` (`users`)**: Internal `id` (UUID PK `@default(uuid())`), external `clerkUserId` (unique indexed string), `email`, `role` (`UserRole` enum), and `collegeDomain`.
- **`ScamCheck` (`scam_checks`)**: Private/anonymous scam analysis records (`SEC-01`), `userId` (nullable FK to `users.id`), `inputHash`, `overallRisk` (`RiskLevel` enum), `primaryCategory`, `secondaryCategories` (JSONB), `signals` (JSONB), `extractedEntities` (JSONB), `modelMetadata` (JSONB `AI-04`), and `actionRecommendations` (JSONB).
- **`ScamPattern` (`scam_patterns`)**: Normalized indicator database (`indicatorType`, `indicatorValue`, `category`, `riskLevel`, `verificationStatus` enum, `reportCount`, `firstReportedAt`, `lastReportedAt`, `metadataPayload` JSONB) with composite unique constraint `@@unique([indicatorType, indicatorValue])` (`REP-03`).
- **`CommunityReport` (`community_reports`)**: Authenticated community submission (`reporterUserId` non-nullable FK to `users.id` `REP-01`), `patternId` (nullable FK to `scam_patterns.id`), indicator attributes, narrative `description`, `status` (`ReportStatus` enum), and `moderatorNotes`.
- **`VictimCase` (`victim_cases`)**: Private victim case record (`userId` non-nullable FK to `users.id`), `title`, `category`, `financialLossAmount` (`Decimal(12, 2)`), `currency`, `status` (`CaseStatus` enum), and `officialComplaintAckNo`.
- **`CaseTimelineEvent` (`case_timeline_events`)**: Chronological event (`caseId` FK with cascade delete, `eventTimestamp`, `eventType`, `description`, `amount`, `counterpartyIdentifier`).
- **`CaseEvidence` (`case_evidence`)**: Private evidence file metadata (`caseId` FK with cascade delete, `fileKey` unique indexed, `fileName`, `fileSizeBytes` BigInt, `contentType`, `sha256Checksum`, `magicSignatureVerified`).
- **`CaseSupportGrant` (`case_support_grants` — `SEC-07`)**: Explicit, time-bounded user authorization for moderator access (`caseId` FK with cascade delete, `grantedByUserId` FK to `users.id`, `granteeUserId` FK to `users.id`, `expiresAt`, `revokedAt`, `rationale`).
- **`AuditEvent` (`audit_events` — `SEC-06`)**: Append-only security audit log (`actorId`, `actorRole`, `action`, `targetResourceType`, `targetResourceId`, `details` JSONB without raw PII/secrets, `ipAddressHash`, `createdAt`).

### 3. Baseline Migration & PostgreSQL Append-Only Trigger
- Generated migration `prisma/migrations/20260925000000_initial_schema/migration.sql` with full DDL, indexes, foreign keys, and PostgreSQL trigger function `prevent_audit_events_mutation()` bound as `trg_audit_events_prevent_mutation` on `audit_events`.
- Applied migration to live PostgreSQL database via `prisma migrate deploy`.

### 4. Integration Test Suite & CI Validation
- Authored `scamfy/lib/prisma.test.ts` containing 5 comprehensive integration tests verifying:
  1. `User` creation, role defaults, and unique `clerkUserId` rejection.
  2. `ScamCheck` creation for anonymous and authenticated users with structured JSON signals.
  3. `ScamPattern` composite uniqueness on `(indicator_type, indicator_value)` (`REP-03`).
  4. `User` -> `VictimCase` -> `CaseEvidence`, `CaseTimelineEvent`, & `CaseSupportGrant` ownership chain and cascade deletions (`SEC-07`).
  5. `AuditEvent` append-only enforcement at both Prisma Client extension and PostgreSQL trigger boundaries (`SEC-06`).

---

## Verification Results

All 5 canonical gates pass with zero errors:
1. `npm run typecheck` — 0 errors
2. `npm run lint` — 0 warnings, 0 errors
3. `npm run test:run` — 8/8 tests passed (including PostgreSQL Prisma integration tests)
4. `ruff check backend/` & `ruff format --check backend/` — 8 backend files clean
5. `pytest backend/tests` — 2/2 tests passed (stateless health check & error sanitization)

See [VERIFICATION.md](./VERIFICATION.md) for full gate execution output.

---

## Next Steps

With the Prisma ORM domain schema, database migrations, triggers, and integration test suite fully verified against PostgreSQL, Milestone 0 proceeds to:
- **Phase 4: Design System & Interaction Primitives** (`/gsd-plan-phase 4`).

