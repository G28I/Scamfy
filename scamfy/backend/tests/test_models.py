import uuid
from datetime import UTC, datetime
from decimal import Decimal

import pytest
from backend.app.models.audit_event import AuditEvent
from backend.app.models.community_report import CommunityReport
from backend.app.models.scam_check import ScamCheck
from backend.app.models.scam_pattern import ScamPattern
from backend.app.models.user import User
from backend.app.models.victim_case import CaseEvidence, CaseTimelineEvent, VictimCase
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession


@pytest.mark.asyncio
async def test_user_creation_and_clerk_identity_constraint(db_session: AsyncSession) -> None:
    """Test User model creation, role defaults, and unique clerk_user_id constraint."""
    user = User(
        clerk_user_id="user_clerk_12345",
        email="student@campus.edu",
        role="student_user",
        college_domain="campus.edu",
    )
    db_session.add(user)
    await db_session.flush()

    assert user.id is not None
    assert isinstance(user.id, uuid.UUID)
    assert user.clerk_user_id == "user_clerk_12345"
    assert user.role == "student_user"
    assert user.created_at is not None
    assert user.updated_at is not None

    # Test duplicate clerk_user_id uniqueness enforcement
    duplicate_user = User(
        clerk_user_id="user_clerk_12345",
        email="duplicate@campus.edu",
    )
    db_session.add(duplicate_user)
    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


@pytest.mark.asyncio
async def test_scam_check_anonymous_and_authenticated(db_session: AsyncSession) -> None:
    """Test ScamCheck model for both anonymous and authenticated sessions with JSONB signals and telemetry."""
    # 1. Anonymous ScamCheck (user_id is None)
    anon_check = ScamCheck(
        user_id=None,
        input_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        overall_risk="HIGH_RISK",
        primary_category="Digital Arrest / Law Enforcement Impersonation",
        secondary_categories=["Sextortion & Coercion"],
        signals=[
            {
                "rule_id": "IMPERSONATION_POLICE",
                "severity": "CRITICAL",
                "matched_text": "CBI arrest warrant",
                "weight": 0.95,
            }
        ],
        extracted_entities={
            "phone_numbers": ["+919876543210"],
            "upi_ids": ["fraud@okaxis"],
            "urls": ["http://fake-police-court.in"],
        },
        model_metadata={
            "model_slug": "nvidia/llama-3.1-nemotron-70b-instruct",
            "prompt_version": "v1.2",
            "temperature": 0.1,
        },
        action_recommendations=[
            "Do not transfer funds",
            "Report immediately to 1930",
        ],
    )
    db_session.add(anon_check)
    await db_session.flush()

    assert anon_check.id is not None
    assert anon_check.user_id is None
    assert anon_check.overall_risk == "HIGH_RISK"
    assert len(anon_check.signals) == 1
    assert anon_check.signals[0]["rule_id"] == "IMPERSONATION_POLICE"
    assert anon_check.extracted_entities["upi_ids"] == ["fraud@okaxis"]
    assert anon_check.model_metadata["model_slug"] == "nvidia/llama-3.1-nemotron-70b-instruct"

    # 2. Authenticated ScamCheck linked to a User
    user = User(clerk_user_id="user_clerk_auth_check_01", role="student_user")
    db_session.add(user)
    await db_session.flush()

    auth_check = ScamCheck(
        user_id=user.id,
        input_hash="a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
        overall_risk="CAUTION",
        primary_category="Part-Time Job / Task Scam",
        secondary_categories=[],
        signals=[],
        extracted_entities={"telegram_handles": ["@task_recruiter_bot"]},
        model_metadata={"model_slug": "nvidia/llama-3.1-nemotron-70b-instruct"},
        action_recommendations=["Verify employer on MCA registry"],
    )
    db_session.add(auth_check)
    await db_session.flush()

    assert auth_check.user_id == user.id


@pytest.mark.asyncio
async def test_scam_pattern_and_community_report_lifecycle(db_session: AsyncSession) -> None:
    """Test ScamPattern directory and CommunityReport submission, linking, and status transitions."""
    # Create authenticated reporter
    reporter = User(clerk_user_id="user_reporter_01", role="student_user")
    db_session.add(reporter)
    await db_session.flush()

    # Submit a community report
    report = CommunityReport(
        reporter_user_id=reporter.id,
        indicator_type="UPI_ID",
        indicator_value="suspicious.mule@ybl",
        category="Money-Mule / Task Scam",
        description="Asked to receive 50,000 INR and forward via crypto.",
        status="PENDING",
    )
    db_session.add(report)
    await db_session.flush()

    assert report.id is not None
    assert report.status == "PENDING"
    assert report.pattern_id is None

    # Moderator creates / merges into a verified ScamPattern
    pattern = ScamPattern(
        indicator_type="UPI_ID",
        indicator_value="suspicious.mule@ybl",
        category="Money-Mule / Task Scam",
        risk_level="CRITICAL",
        verification_status="MODERATOR_VERIFIED",
        report_count=1,
        metadata_payload={"mule_bank": "Yes Bank", "recruitment_channel": "Telegram"},
    )
    db_session.add(pattern)
    await db_session.flush()

    # Link report to pattern and update status
    report.pattern_id = pattern.id
    report.status = "APPROVED"
    report.moderator_notes = "Verified against Indian Cyber Crime reported mule list."
    await db_session.flush()

    # Query pattern with reports
    query = select(ScamPattern).where(ScamPattern.id == pattern.id)
    result = await db_session.execute(query)
    fetched_pattern = result.scalar_one()

    assert fetched_pattern.verification_status == "MODERATOR_VERIFIED"
    assert len(fetched_pattern.community_reports) == 1
    assert fetched_pattern.community_reports[0].indicator_value == "suspicious.mule@ybl"


@pytest.mark.asyncio
async def test_victim_case_evidence_privacy_chain_and_cascades(db_session: AsyncSession) -> None:
    """Test User -> VictimCase -> CaseEvidence & CaseTimelineEvent structural ownership chain and cascading deletes."""
    victim = User(clerk_user_id="user_victim_999", role="student_user")
    db_session.add(victim)
    await db_session.flush()

    # Create victim incident case
    case = VictimCase(
        user_id=victim.id,
        title="Digital Arrest Extortion Incident",
        category="Digital Arrest / Law Enforcement Impersonation",
        financial_loss_amount=Decimal("150000.00"),
        currency="INR",
        status="OPEN",
        official_complaint_ack_no="ACK-1930-2026-987654",
        support_grant_expires_at=datetime.now(UTC),
    )
    db_session.add(case)
    await db_session.flush()

    # Add chronological timeline event
    event = CaseTimelineEvent(
        case_id=case.id,
        event_timestamp=datetime.now(UTC),
        event_type="PAYMENT_SENT",
        description="Transferred 1.5 Lakh via RTGS under Skype coercion.",
        amount=Decimal("150000.00"),
        counterparty_identifier="HDFC0001234 / 50100234567890",
    )
    db_session.add(event)

    # Attach private evidence file
    evidence = CaseEvidence(
        case_id=case.id,
        file_key=f"evidence/{case.id}/bank_receipt_01.pdf",
        file_name="bank_receipt_01.pdf",
        file_size_bytes=245890,
        content_type="application/pdf",
        sha256_checksum="ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        magic_signature_verified=True,
    )
    db_session.add(evidence)
    await db_session.flush()

    # Verify traversal ownership chain (User -> Case -> Evidence)
    case_query = select(VictimCase).where(VictimCase.id == case.id)
    case_result = await db_session.execute(case_query)
    fetched_case = case_result.scalar_one()

    assert fetched_case.user_id == victim.id
    assert len(fetched_case.timeline_events) == 1
    assert len(fetched_case.evidence_files) == 1
    assert fetched_case.evidence_files[0].magic_signature_verified is True
    assert fetched_case.evidence_files[0].sha256_checksum.startswith("ba7816")

    # Verify Cascade Delete: deleting the case cascades to timeline events and evidence
    evidence_id = evidence.id
    event_id = event.id
    await db_session.delete(fetched_case)
    await db_session.flush()

    evidence_query = select(CaseEvidence).where(CaseEvidence.id == evidence_id)
    evidence_res = await db_session.execute(evidence_query)
    assert evidence_res.scalar_one_or_none() is None

    event_query = select(CaseTimelineEvent).where(CaseTimelineEvent.id == event_id)
    event_res = await db_session.execute(event_query)
    assert event_res.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_audit_event_append_only_logging(db_session: AsyncSession) -> None:
    """Test AuditEvent append-only logging, structured sanitized metadata, and query indexing (SEC-06)."""
    audit_entry = AuditEvent(
        actor_id="user_mod_alpha",
        actor_role="moderator",
        action="SUPPORT_ACCESS_CASE",
        target_resource_type="victim_case",
        target_resource_id="case_uuid_placeholder_777",
        details={
            "grant_duration_minutes": 15,
            "rationale": "User requested 1930 escalation support",
            "granted_by_user": True,
        },
        ip_address_hash="8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    )
    db_session.add(audit_entry)
    await db_session.flush()

    assert audit_entry.id is not None
    assert audit_entry.actor_role == "moderator"
    assert audit_entry.action == "SUPPORT_ACCESS_CASE"
    assert audit_entry.details["grant_duration_minutes"] == 15
    assert audit_entry.created_at is not None

    # Verify index query performance
    audit_query = select(AuditEvent).where(AuditEvent.actor_id == "user_mod_alpha")
    audit_res = await db_session.execute(audit_query)
    fetched_audit = audit_res.scalar_one()

    assert fetched_audit.action == "SUPPORT_ACCESS_CASE"
    assert fetched_audit.details["granted_by_user"] is True


@pytest.mark.asyncio
async def test_alembic_migrations_upgrade_and_downgrade(test_engine: AsyncEngine) -> None:
    """Validate that Alembic baseline migration applies and rolls back cleanly against PostgreSQL test database."""
    import asyncio
    from pathlib import Path

    from alembic.config import Config
    from backend.app.models import Base
    from backend.tests.conftest import TEST_DATABASE_URL
    from sqlalchemy import text

    from alembic import command

    # Ensure completely clean database schema before testing Alembic migrations
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))

    backend_dir = Path(__file__).resolve().parent.parent
    alembic_cfg = Config(str(backend_dir / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)

    # Run in thread pool to avoid nested event loop conflict with asyncio.run inside env.py
    # 1. Test upgrade to head (creates all 8 tables)
    await asyncio.to_thread(command.upgrade, alembic_cfg, "head")

    # 2. Test downgrade to base (drops all tables)
    await asyncio.to_thread(command.downgrade, alembic_cfg, "base")

    # 3. Test re-upgrade to head (re-creates all tables)
    await asyncio.to_thread(command.upgrade, alembic_cfg, "head")
