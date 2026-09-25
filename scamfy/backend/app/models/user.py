from typing import TYPE_CHECKING

from backend.app.models.base import Base, TimestampMixin, UUIDMixin
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from backend.app.models.community_report import CommunityReport
    from backend.app.models.scam_check import ScamCheck
    from backend.app.models.victim_case import VictimCase


class User(Base, UUIDMixin, TimestampMixin):
    """User profile mapping external Clerk authentication identity to internal Scamfy UUID."""

    __tablename__ = "users"

    # External Clerk Authentication Subject ID (Indexed for O(1) JWT token lookups)
    clerk_user_id: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        index=True,
        nullable=False,
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    # RBAC Role: 'student_user', 'college_admin', 'moderator'
    role: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="student_user",
        server_default="student_user",
    )

    # Optional institutional campus domain for college admins/students
    college_domain: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Relationships
    scam_checks: Mapped[list["ScamCheck"]] = relationship(
        "ScamCheck",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    community_reports: Mapped[list["CommunityReport"]] = relationship(
        "CommunityReport",
        back_populates="reporter",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    victim_cases: Mapped[list["VictimCase"]] = relationship(
        "VictimCase",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
