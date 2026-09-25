import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from backend.app.models.base import Base, TimestampMixin, UUIDMixin
from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from backend.app.models.user import User


class VictimCase(Base, UUIDMixin, TimestampMixin):
    """Private incident case record for victims to organize evidence, timeline, and loss records."""

    __tablename__ = "victim_cases"

    # Strict ownership boundary (Non-nullable foreign key to users.id)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Case metadata
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    # Financial loss amount (INR / foreign currency)
    financial_loss_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="INR",
        server_default="INR",
    )

    # Lifecycle status: 'DRAFT', 'OPEN', 'OFFICIAL_REPORTED', 'RESOLVED', 'ARCHIVED'
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="OPEN",
        server_default="OPEN",
        index=True,
    )

    # Official 1930 / cybercrime.gov.in complaint reference or acknowledgment number
    official_complaint_ack_no: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        index=True,
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="victim_cases",
    )

    timeline_events: Mapped[list["CaseTimelineEvent"]] = relationship(
        "CaseTimelineEvent",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="CaseTimelineEvent.event_timestamp",
        lazy="selectin",
    )

    evidence_files: Mapped[list["CaseEvidence"]] = relationship(
        "CaseEvidence",
        back_populates="case",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    support_grants: Mapped[list["CaseSupportGrant"]] = relationship(
        "CaseSupportGrant",
        back_populates="case",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class CaseTimelineEvent(Base, UUIDMixin, TimestampMixin):
    """Chronological event in a victim's incident timeline."""

    __tablename__ = "case_timeline_events"

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("victim_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    event_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    # Event Type: 'INITIAL_CONTACT', 'PAYMENT_SENT', 'PAYMENT_REQUESTED', 'THREAT_RECEIVED', 'POLICE_REPORTED', 'NOTE'
    event_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Optional monetary amount involved in this specific event
    amount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    # Counterparty identifier (UPI ID, Telegram handle, account number, phone number)
    counterparty_identifier: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Relationship
    case: Mapped["VictimCase"] = relationship(
        "VictimCase",
        back_populates="timeline_events",
    )


class CaseEvidence(Base, UUIDMixin, TimestampMixin):
    """Private evidence artifact attached to a victim case (receipts, screenshots, chat exports)."""

    __tablename__ = "case_evidence"

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("victim_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Object storage object key (Cloudflare R2 / S3)
    file_key: Mapped[str] = mapped_column(
        String(512),
        unique=True,
        nullable=False,
        index=True,
    )

    # Sanitized original file name
    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # File size in bytes
    file_size_bytes: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    # Validated MIME content type (image/png, image/jpeg, application/pdf)
    content_type: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )

    # SHA-256 cryptographic digest for tamper-evidence
    sha256_checksum: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    # Confirmation that file signature / magic bytes were validated
    magic_signature_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    # Relationship
    case: Mapped["VictimCase"] = relationship(
        "VictimCase",
        back_populates="evidence_files",
    )


class CaseSupportGrant(Base, UUIDMixin, TimestampMixin):
    """Explicit, user-granted, time-bounded authorization for a specific moderator to access a victim case (SEC-07)."""

    __tablename__ = "case_support_grants"

    # Victim case being accessed
    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("victim_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Granting victim user (owner)
    granted_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Authorized moderator user (grantee)
    grantee_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Time-bounded expiration
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    # Explicit revocation timestamp (NULL if active, set when revoked)
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    # Optional scope or rationale for grant
    rationale: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Relationships
    case: Mapped["VictimCase"] = relationship(
        "VictimCase",
        back_populates="support_grants",
    )
    granting_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[granted_by_user_id],
    )
    grantee_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[grantee_user_id],
    )
