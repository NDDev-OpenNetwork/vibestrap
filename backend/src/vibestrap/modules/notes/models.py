from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from vibestrap.db.base import Base
from vibestrap.db.mixins import OwnedByUser, Timestamps, UUIDPrimaryKey


class Note(UUIDPrimaryKey, OwnedByUser, Timestamps, Base):
    __tablename__ = "note"

    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str | None] = mapped_column(Text, default=None)
    pinned: Mapped[bool] = mapped_column(default=False, server_default="false")
