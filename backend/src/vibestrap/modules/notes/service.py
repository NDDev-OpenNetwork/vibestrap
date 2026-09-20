"""Note persistence. Every query is scoped to the owner; the HTTP layer checks permissions."""

from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from vibestrap.core.errors import APIError
from vibestrap.core.pagination import PageParams, paginate
from vibestrap.modules.notes.models import Note
from vibestrap.modules.notes.schemas import NoteCreate, NoteUpdate


async def list_notes(
    session: AsyncSession, owner_id: str, params: PageParams, *, pinned: bool | None = None
) -> tuple[Sequence[Note], int]:
    statement = select(Note).where(Note.owner_id == owner_id)
    if pinned is not None:
        statement = statement.where(Note.pinned.is_(pinned))
    # Tie-break on the primary key: rows sharing a timestamp would otherwise
    # repeat or vanish between pages.
    ordered = statement.order_by(Note.created_at.desc(), Note.id.desc())
    return await paginate(session, ordered, params)


async def get_note(session: AsyncSession, owner_id: str, note_id: UUID) -> Note:
    note = await session.scalar(select(Note).where(Note.id == note_id, Note.owner_id == owner_id))
    if note is None:
        raise APIError(404, "not_found", "Note not found")
    return note


async def create_note(session: AsyncSession, owner_id: str, data: NoteCreate) -> Note:
    note = Note(owner_id=owner_id, **data.model_dump())
    session.add(note)
    await session.commit()
    await session.refresh(note)
    return note


async def update_note(
    session: AsyncSession, owner_id: str, note_id: UUID, data: NoteUpdate
) -> Note:
    note = await get_note(session, owner_id, note_id)
    for field, value in data.changes().items():
        setattr(note, field, value)
    await session.commit()
    await session.refresh(note)
    return note


async def delete_note(session: AsyncSession, owner_id: str, note_id: UUID) -> None:
    note = await get_note(session, owner_id, note_id)
    await session.delete(note)
    await session.commit()
