-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "clerk_user_id" VARCHAR(128) NOT NULL,
    "email" VARCHAR(255),
    "role" VARCHAR(32) NOT NULL DEFAULT 'student_user',
    "college_domain" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scam_checks" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "input_hash" VARCHAR(64) NOT NULL,
    "overall_risk" VARCHAR(32) NOT NULL,
    "primary_category" VARCHAR(64) NOT NULL,
    "secondary_categories" JSONB NOT NULL DEFAULT '[]',
    "signals" JSONB NOT NULL DEFAULT '[]',
    "extracted_entities" JSONB NOT NULL DEFAULT '{}',
    "model_metadata" JSONB NOT NULL DEFAULT '{}',
    "action_recommendations" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scam_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scam_patterns" (
    "id" UUID NOT NULL,
    "indicator_type" VARCHAR(32) NOT NULL,
    "indicator_value" VARCHAR(512) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "risk_level" VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    "verification_status" VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
    "report_count" INTEGER NOT NULL DEFAULT 1,
    "first_reported_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_reported_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata_payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scam_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_reports" (
    "id" UUID NOT NULL,
    "reporter_user_id" UUID NOT NULL,
    "pattern_id" UUID,
    "indicator_type" VARCHAR(32) NOT NULL,
    "indicator_value" VARCHAR(512) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    "moderator_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "victim_cases" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "financial_loss_amount" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    "official_complaint_ack_no" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "victim_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_timeline_events" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "event_timestamp" TIMESTAMPTZ(6) NOT NULL,
    "event_type" VARCHAR(64) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2),
    "counterparty_identifier" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_evidence" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "file_key" VARCHAR(512) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "content_type" VARCHAR(128) NOT NULL,
    "sha256_checksum" VARCHAR(64) NOT NULL,
    "magic_signature_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_support_grants" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "granted_by_user_id" UUID NOT NULL,
    "grantee_user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "rationale" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_support_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "actor_id" VARCHAR(128) NOT NULL,
    "actor_role" VARCHAR(32) NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "target_resource_type" VARCHAR(64) NOT NULL,
    "target_resource_id" VARCHAR(128) NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ip_address_hash" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE INDEX "users_clerk_user_id_idx" ON "users"("clerk_user_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "scam_checks_user_id_idx" ON "scam_checks"("user_id");

-- CreateIndex
CREATE INDEX "scam_checks_input_hash_idx" ON "scam_checks"("input_hash");

-- CreateIndex
CREATE INDEX "scam_patterns_indicator_type_idx" ON "scam_patterns"("indicator_type");

-- CreateIndex
CREATE INDEX "scam_patterns_indicator_value_idx" ON "scam_patterns"("indicator_value");

-- CreateIndex
CREATE INDEX "scam_patterns_verification_status_idx" ON "scam_patterns"("verification_status");

-- CreateIndex
CREATE UNIQUE INDEX "scam_patterns_indicator_type_indicator_value_key" ON "scam_patterns"("indicator_type", "indicator_value");

-- CreateIndex
CREATE INDEX "community_reports_reporter_user_id_idx" ON "community_reports"("reporter_user_id");

-- CreateIndex
CREATE INDEX "community_reports_pattern_id_idx" ON "community_reports"("pattern_id");

-- CreateIndex
CREATE INDEX "community_reports_indicator_value_idx" ON "community_reports"("indicator_value");

-- CreateIndex
CREATE INDEX "community_reports_status_idx" ON "community_reports"("status");

-- CreateIndex
CREATE INDEX "victim_cases_user_id_idx" ON "victim_cases"("user_id");

-- CreateIndex
CREATE INDEX "victim_cases_status_idx" ON "victim_cases"("status");

-- CreateIndex
CREATE INDEX "victim_cases_official_complaint_ack_no_idx" ON "victim_cases"("official_complaint_ack_no");

-- CreateIndex
CREATE INDEX "case_timeline_events_case_id_idx" ON "case_timeline_events"("case_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_evidence_file_key_key" ON "case_evidence"("file_key");

-- CreateIndex
CREATE INDEX "case_evidence_case_id_idx" ON "case_evidence"("case_id");

-- CreateIndex
CREATE INDEX "case_evidence_file_key_idx" ON "case_evidence"("file_key");

-- CreateIndex
CREATE INDEX "case_support_grants_case_id_idx" ON "case_support_grants"("case_id");

-- CreateIndex
CREATE INDEX "case_support_grants_granted_by_user_id_idx" ON "case_support_grants"("granted_by_user_id");

-- CreateIndex
CREATE INDEX "case_support_grants_grantee_user_id_idx" ON "case_support_grants"("grantee_user_id");

-- CreateIndex
CREATE INDEX "case_support_grants_expires_at_idx" ON "case_support_grants"("expires_at");

-- CreateIndex
CREATE INDEX "case_support_grants_revoked_at_idx" ON "case_support_grants"("revoked_at");

-- CreateIndex
CREATE INDEX "audit_events_actor_id_idx" ON "audit_events"("actor_id");

-- CreateIndex
CREATE INDEX "audit_events_action_idx" ON "audit_events"("action");

-- CreateIndex
CREATE INDEX "audit_events_target_resource_id_idx" ON "audit_events"("target_resource_id");

-- CreateIndex
CREATE INDEX "audit_events_created_at_idx" ON "audit_events"("created_at");

-- AddForeignKey
ALTER TABLE "scam_checks" ADD CONSTRAINT "scam_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "scam_patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "victim_cases" ADD CONSTRAINT "victim_cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_timeline_events" ADD CONSTRAINT "case_timeline_events_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "victim_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_evidence" ADD CONSTRAINT "case_evidence_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "victim_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_support_grants" ADD CONSTRAINT "case_support_grants_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "victim_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_support_grants" ADD CONSTRAINT "case_support_grants_granted_by_user_id_fkey" FOREIGN KEY ("granted_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_support_grants" ADD CONSTRAINT "case_support_grants_grantee_user_id_fkey" FOREIGN KEY ("grantee_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SEC-06: Database-level append-only enforcement via PostgreSQL triggers
CREATE OR REPLACE FUNCTION prevent_audit_events_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_events is an append-only table: UPDATE and DELETE operations are prohibited';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_events_prevent_mutation
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_events_mutation();
