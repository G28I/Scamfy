# Phase 7: Scam Pattern Database & Community Reporting — Research

- **Phase**: 07
- **Milestone**: Milestone 2 (Slice 2 - Community Intel & Mule Shield)
- **Status**: Complete 🔬
- **Target Deliverable**: Robust community threat intelligence ingestion pipeline, deduplication engine, public threat intelligence directory with strict verification tier separation, and audit-logged moderation console.

---

## 1. Indicator Normalization & Sanitization (`REP-01`, `REP-03`)

To guarantee accurate deduplication across the composite unique index `[indicatorType, indicatorValue]`:
1. **UPI IDs (`UPI_ID`)**: Lowercase, strip whitespace, validate format (`^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$`).
2. **Phone Numbers (`PHONE`)**: Strip spaces, hyphens, and parentheses; normalize Indian 10-digit mobile numbers (e.g. `+919876543210` -> `9876543210`).
3. **Domains / URLs (`DOMAIN`)**: Parse hostname via `URL` / `urllib.parse`, strip `www.`, lowercase, extract clean hostname or canonical URL path.
4. **Social Handles (`HANDLE`)**: Lowercase, strip leading `@`, normalize platform prefix if applicable.
5. **Bank Accounts (`BANK_ACC`)**: Strip spaces/dashes, uppercase IFSC if present.
6. **Scripts / Phrases (`SCRIPT`)**: Lowercase, collapse multiple spaces, trim.

---

## 2. Deduplication & Linking Strategy (`REP-03`)

When a user submits a report:
1. Normalize `indicatorType` and `indicatorValue`.
2. Look up existing `ScamPattern` using `findUnique({ where: { uq_scam_patterns_indicator_type_value: { indicatorType, indicatorValue } } })`.
3. If pattern exists:
   - Increment `reportCount += 1`.
   - Update `lastReportedAt = new Date()`.
   - If user reports a higher severity category, update pattern `metadataPayload`.
   - Link new `CommunityReport` to this `patternId`.
   - **Crucial Rule**: `verificationStatus` remains unchanged (or remains `UNVERIFIED` / `COMMUNITY_FLAGGED`). `reportCount` accumulation alone NEVER auto-promotes to `MODERATOR_VERIFIED`.
4. If pattern does not exist:
   - Create new `ScamPattern` with `reportCount = 1`, `verificationStatus = UNVERIFIED`.
   - Link new `CommunityReport` to the newly created `pattern.id`.
5. Individual reporter identity (`reporterUserId`) and timestamps are preserved in `CommunityReport` records without losing provenance.

---

## 3. Public Directory Presentation & Anti-Doxxing Guardrails (`REP-04`, `OOS-04`)

1. **Strict Verification Tier Separation**:
   - **Verified Pattern Signatures (`MODERATOR_VERIFIED`)**:
     - Distinct badge: `Verified Pattern Signature` (Emerald / Blue shield styling).
     - Confirmed active cybercrime pattern signatures that passed explicit human moderator verification.
     - Never claim a person or organization has been legally determined to be fraudulent.
   - **Unverified Community Reports (`COMMUNITY_FLAGGED` / `UNVERIFIED`)**:
     - Distinct badge: `Unverified Community Report` (Amber / Muted warning styling).
     - Prominent disclaimer that community flags are crowd-sourced and unverified.
     - Never placed in a section whose title implies verification.
2. **Anti-Doxxing & Privacy Controls**:
   - Public view displays indicator value (with optional masking for bank accounts/personal names), category, report count, first/last seen timestamps, and public threat summary.
   - Reporter personal user IDs (`reporterUserId`), email addresses, and private moderator internal notes are strictly excluded from all public API responses (`/api/patterns`).

---

## 4. Moderator Review & Immutable Audit Logging (`REP-05`, `SEC-06`)

1. **Moderator Actions**:
   - `APPROVE`: Transitions report to `APPROVED`, elevates linked `ScamPattern` to `MODERATOR_VERIFIED`, sets verified risk level (`HIGH_RISK` / `CRITICAL`).
   - `REJECT`: Transitions report to `REJECTED`, records internal notes, does not mark pattern verified.
   - `MERGE`: Merges multiple reports under a canonical pattern signature while preserving contributing report provenance.
   - `DISMISS`: Suppresses false-positive pattern (`DISMISSED`), ensuring it does not appear as verified in public UI.
2. **Audit Event Generation (`SEC-06`)**:
   - Every moderation action produces an `AuditEvent` with `actorId`, `actorRole`, `action` (e.g. `REPORT_APPROVED`, `PATTERN_VERIFIED`, `PATTERN_DISMISSED`), `targetResourceType`, and `targetResourceId`.
   - Guarded by the PostgreSQL append-only trigger established in Phase 3.
