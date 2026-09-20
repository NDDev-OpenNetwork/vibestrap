from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from vibestrap.core.schemas import PartialUpdate, ReadModel

TITLE = Field(min_length=1, max_length=200)
BODY = Field(default=None, max_length=10_000)


class NoteCreate(BaseModel):
    title: str = TITLE
    body: str | None = BODY
    pinned: bool = False


class NoteUpdate(PartialUpdate):
    """Only the keys present in the request are written. `null` clears `body` only."""

    NON_NULLABLE = ("title", "pinned")

    title: str | None = Field(default=None, min_length=1, max_length=200)
    body: str | None = BODY
    pinned: bool | None = None


class NoteRead(ReadModel):
    id: UUID
    title: str
    body: str | None
    pinned: bool
    created_at: datetime
    updated_at: datetime
