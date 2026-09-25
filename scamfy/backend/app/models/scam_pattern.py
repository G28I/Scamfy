from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from backend.app.models.base import Base, TimestampMixin, UUIDMixin
from sqlalchemy import DateTime, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from backend.app.models.community_report import CommunityReport


class ScamPattern(Base, UUIDMixin, TimestampMixin):
    """Normalized scam indicator pattern database entry for community intelligence."""

    __tablename__ = "scam_patterns"
    __table_args__ = (
        UniqueConstraint(
            "indicator_type",
            "indicator_value",
            name="uq_scam_patterns_indicator_type_value",
        ),
    )

    # Indicator Type: 'UPI_ID', 'PHONE_NUMBER', 'URL_DOMAIN', 'TELEGRAM_HANDLE', 'BANK_ACCOUNT', 'JOB_SCRIPT', 'OTHER'
    indicator_type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        index=True,
    )

    # Normalized indicator value (lowercase UPI/handle/domain)
    indicator_value: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
        index=True,
    )

    # Primary scam category from taxonomy
    category: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    # Risk level rating: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    risk_level: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="HIGH",
    )

    # Verification status: 'UNVERIFIED', 'COMMUNITY_FLAGGED', 'MODERATOR_VERIFIED', 'DISMISSED'
    verification_status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="UNVERIFIED",
        server_default="UNVERIFIED",
        index=True,
    )

    # Cumulative submission count
    report_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default="1",
    )

    # Chronological timestamps
    first_reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        server_default=func.now(),
    )

    last_reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        server_default=func.now(),
    )

    # Variable pattern payload metadata
    metadata_payload: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default="{}",
    )

    # Linked community submissions
    community_reports: Mapped[list["CommunityReport"]] = relationship(
        "CommunityReport",
        back_populates="pattern",
        lazy="selectin",
    )
