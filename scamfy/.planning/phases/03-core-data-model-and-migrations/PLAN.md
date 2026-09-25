# Phase 3: Core Data Model & Migrations — Plan

- **Phase**: 03
- **Milestone**: 0 (Foundation)
- **Status**: Ready for Execution ⚪
- **Goal**: Implement the authoritative PostgreSQL database layer using Prisma ORM (`prisma`, `@prisma/client`, `prisma migrate`), Next.js singleton Prisma Client, generated TypeScript types, and comprehensive Vitest integration tests against a dedicated PostgreSQL test database.
- **Requirements Covered**: `SEC-06`, `SEC-07`, `CASE-01..04`, `REP-01..03`, `AI-04`
- **Architecture Baseline**: [ADR 0001: Prisma ORM for Domain Persistence and FastAPI as Stateless AI Boundary](../../../docs/adr/0001-prisma-domain-persistence-and-fastapi-ai-boundary.md)
- **Scope Fences**: No frontend UI changes, product domain business logic (scoring rules/Nemotron inference), R2 storage client, or 1930 official gateway integrations are implemented in this phase. FastAPI remains a stateless AI service boundary and does not mutate domain tables.

---

## Detailed Task Breakdown

### Task 1: Prisma ORM Setup, Dependencies & Singleton Client
- **Action**:
  - Install `prisma` (devDependencies) and `@prisma/client` (dependencies) in root Next.js project.
  - Initialize `prisma/schema.prisma` configured for PostgreSQL (`provider = "postgresql"`, `url = env("DATABASE_URL")`).
  - Create `lib/prisma.ts`:
    - Singleton `PrismaClient` instance with development hot-reload protection (`globalForPrisma`).
    - Prisma Client extension / middleware enforcing append-only guardrails for `AuditEvent` (`SEC-06`).
- **Verification**: `npx prisma --version` and `npm run typecheck` validate client setup.

### Task 2: Authoritative Prisma Schema (9 Core Domain Entities)
- **Action**:
  - Define declarative models in `prisma/schema.prisma`:
    - `User`: Internal UUID `id` (`@id @default(uuid()) @db.Uuid`), external `clerkUserId` (`@unique`, indexed), `email`, `role` (`student_user`, `college_admin`, `moderator`), `collegeDomain`, `createdAt`, `updatedAt`, relations.
    - `ScamCheck`: `id` (`UUID`), nullable `userId` (`UUID` FK), `inputHash` (`VarChar(64)`), `overallRisk`, `primaryCategory`, `secondaryCategories` (`Json`), `signals` (`Json`), `extractedEntities` (`Json`), `modelMetadata` (`Json` `AI-04`), `actionRecommendations` (`Json`), `createdAt`.
    - `ScamPattern`: `id` (`UUID`), `indicatorType`, `indicatorValue`, `category`, `riskLevel`, `verificationStatus`, `reportCount`, `firstReportedAt`, `lastReportedAt`, `metadataPayload` (`Json`), and composite unique constraint `@@unique([indicatorType, indicatorValue])` for deduplication (`REP-03`).
    - `CommunityReport`: `id` (`UUID`), `reporterUserId` (`UUID` FK to `User`), `patternId` (nullable `UUID` FK to `ScamPattern`), `indicatorType`, `indicatorValue`, `category`, `description` (`Text`), `status` (`PENDING`, `APPROVED`, `REJECTED`, `MERGED`), `moderatorNotes` (`Text`), `createdAt`, `updatedAt`.
    - `VictimCase`: `id` (`UUID`), `userId` (`UUID` FK to `User`), `title`, `category`, `financialLossAmount` (`Decimal(12, 2)` nullable), `currency` (default `'INR'`), `status` (`DRAFT`, `OPEN`, `OFFICIAL_REPORTED`, `RESOLVED`, `ARCHIVED`), `officialComplaintAckNo`, `createdAt`, `updatedAt`.
    - `CaseTimelineEvent`: `id` (`UUID`), `caseId` (`UUID` FK to `VictimCase` with `@onDelete: Cascade`), `eventTimestamp`, `eventType`, `description` (`Text`), `amount` (`Decimal(12, 2)`), `counterpartyIdentifier`, `createdAt`, `updatedAt`.
    - `CaseEvidence`: `id` (`UUID`), `caseId` (`UUID` FK to `VictimCase` with `@onDelete: Cascade`), `fileKey` (`@unique`), `fileName`, `fileSizeBytes` (`BigInt`), `contentType`, `sha256Checksum` (`VarChar(64)`), `magicSignatureVerified` (`Boolean`), `createdAt`, `updatedAt`.
    - `CaseSupportGrant` (`SEC-07`): `id` (`UUID`), `caseId` (`UUID` FK to `VictimCase` with `@onDelete: Cascade`), `grantedByUserId` (`UUID` FK to `User`), `granteeUserId` (`UUID` FK to `User`), `expiresAt`, `revokedAt`, `rationale`, `createdAt`, `updatedAt`.
    - `AuditEvent` (`SEC-06`): `id` (`UUID`), `actorId`, `actorRole`, `action`, `targetResourceType`, `targetResourceId`, `details` (`Json` sanitized context metadata without raw secrets/PII), `ipAddressHash`, `createdAt`.
- **Verification**: `npx prisma validate` confirms valid Prisma schema syntax and relation mappings.

### Task 3: Prisma Migrations & PostgreSQL Database Triggers
- **Action**:
  - Generate baseline migration `prisma/migrations/20260925000000_initial_schema/migration.sql` creating all 9 tables, indexes, unique constraints, and foreign key cascades.
  - Add PostgreSQL database trigger `trg_audit_events_prevent_mutation` on `audit_events` to the baseline migration to enforce append-only immutability at the database boundary (`SEC-06`).
  - Run `prisma generate` to produce strictly-typed TypeScript Prisma Client models.
- **Verification**: Execute `npx prisma migrate deploy` / `dev` against PostgreSQL test database.

### Task 4: Real PostgreSQL Integration Test Suite & TypeScript Type Verification
- **Action**:
  - Author `lib/prisma.test.ts` (Vitest integration test suite against live PostgreSQL):
    - Test User creation, role defaults, and unique `clerkUserId` constraint.
    - Test ScamCheck creation with JSON signals and entity payloads (anonymous and authenticated).
    - Test ScamPattern and CommunityReport linking, and ScamPattern composite unique constraint `(indicatorType, indicatorValue)` deduplication (`REP-03`).
    - Test VictimCase, CaseTimelineEvent, CaseEvidence, and CaseSupportGrant ownership chains (`User -> VictimCase -> Evidence / Grants`), explicit revocation, and cascade deletes (`SEC-07`).
    - Test AuditEvent append-only protection (verifying direct SQL UPDATE/DELETE and Prisma Client mutations are rejected at ORM and DB trigger boundaries) (`SEC-06`).
    - Verify strict generated TypeScript types across all 9 domain entities (ensuring no `any` and full compile-time validation).
- **Verification**: Execute `npm run test:run` and `npm run typecheck` ensuring all tests pass against live PostgreSQL.

---

## Canonical Verification Gates (Definition of Done)

| Gate | Verification Command | Passing Criteria |
| :--- | :--- | :--- |
| **Gate 1: Frontend Type Safety** | `npm run typecheck` | Zero TypeScript compiler errors (`tsc --noEmit`) with generated Prisma Client types. |
| **Gate 2: Frontend Linting** | `npm run lint` | Zero ESLint warnings or errors (`eslint .`). |
| **Gate 3: Frontend Unit & Integration Tests** | `npm run test:run` | All Vitest tests (including `lib/prisma.test.ts` against PostgreSQL) pass. |
| **Gate 4: Backend Lint & Format** | `ruff check backend/`<br>`ruff format --check backend/` | Stateless FastAPI backend passes all Ruff lint and formatting checks. |
| **Gate 5: Backend Pytest Suite** | `pytest backend/tests` | FastAPI stateless health and error envelope tests pass. |
| **Canonical Local Suite** | `scripts/verify.ps1` (Win)<br>`scripts/verify.sh` (POSIX) | Full 5-gate pipeline passes in a single command. |
| **Prisma Migration Integrity** | `npx prisma migrate status` | Database schema is in sync with migrations on PostgreSQL test database. |
| **Architecture Decision Record** | `docs/adr/0001-...` | Documented and approved in repository. |
| **Planning Trail** | `VERIFICATION.md`<br>`SUMMARY.md` | Audit trail and phase summary recorded in `.planning/`. |
