from datetime import UTC, datetime
from typing import Any

from backend.app.models.base import Base, UUIDMixin
from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column


class AuditEvent(Base, UUIDMixin):
    """Immutable, append-only audit event trail recording sensitive actions and moderation events (SEC-06).

    This model supports insert and read operations only. Updates and deletes are not permitted.
    """

    __tablename__ = "audit_events"

    # Actor identifier (Clerk user ID, internal UUID, or 'system')
    actor_id: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        index=True,
    )

    # Actor role: 'student_user', 'college_admin', 'moderator', 'system'
    actor_role: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )

    # Action type (e.g., 'MODERATE_REPORT', 'SUPPORT_ACCESS_CASE', 'VERIFY_PATTERN', 'REVOKE_SUPPORT_GRANT')
    action: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )

    # Target resource type ('community_report', 'victim_case', 'scam_pattern')
    target_resource_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    # Target resource identifier
    target_resource_id: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        index=True,
    )

    # Sanitized audit details (Strictly no raw PII, plain credentials, or secret keys)
    details: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default="{}",
    )

    # Hashed client IP address for privacy-safe abuse forensics
    ip_address_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    # Immutable creation timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        server_default=func.now(),
        index=True,
    )
