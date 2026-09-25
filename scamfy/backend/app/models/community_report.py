import uuid
from typing import TYPE_CHECKING

from backend.app.models.base import Base, TimestampMixin, UUIDMixin
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from backend.app.models.scam_pattern import ScamPattern
    from backend.app.models.user import User


class CommunityReport(Base, UUIDMixin, TimestampMixin):
    """Authenticated user submission of a suspicious scam indicator to the community database."""

    __tablename__ = "community_reports"

    # Authenticated reporter (REP-01: Non-nullable identity boundary)
    reporter_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Optional pattern foreign key assigned when verified or merged into the pattern directory
    pattern_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scam_patterns.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Submitted indicator details
    indicator_type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )

    indicator_value: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Triage lifecycle status: 'PENDING', 'APPROVED', 'REJECTED', 'MERGED'
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="PENDING",
        server_default="PENDING",
        index=True,
    )

    # Internal moderator rationale notes
    moderator_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    reporter: Mapped["User"] = relationship(
        "User",
        back_populates="community_reports",
    )

    pattern: Mapped["ScamPattern | None"] = relationship(
        "ScamPattern",
        back_populates="community_reports",
    )
