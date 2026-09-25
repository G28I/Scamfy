import uuid
from typing import TYPE_CHECKING, Any

from backend.app.models.base import Base, TimestampMixin, UUIDMixin
from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from backend.app.models.user import User


class ScamCheck(Base, UUIDMixin, TimestampMixin):
    """Private/anonymous scam analysis record. Isolated from public intelligence views."""

    __tablename__ = "scam_checks"

    # Nullable user foreign key for anonymous analyses (SEC-01)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # SHA-256 hash of normalized input text for deduplication/telemetry
    input_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )

    # Aggregated risk rating: 'SAFE', 'CAUTION', 'SUSPICIOUS', 'HIGH_RISK', 'CRITICAL'
    overall_risk: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )

    # Primary scam category from canonical taxonomy
    primary_category: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    # Secondary taxonomy categories
    secondary_categories: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default="[]",
    )

    # Detected red-flag signal rule triggers and weights
    signals: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default="[]",
    )

    # Extracted entity dictionary: URLs, UPI IDs, phone numbers, bank accounts
    extracted_entities: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default="{}",
    )

    # Model inference telemetry (AI-04: model slug, temperature, prompt version)
    model_metadata: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default="{}",
    )

    # Approved safe action advice recommendations
    action_recommendations: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default="[]",
    )

    # Relationship
    user: Mapped["User | None"] = relationship(
        "User",
        back_populates="scam_checks",
    )
