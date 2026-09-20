"""Reference domain module. Copy this shape for new domains; delete it when unused."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from vibestrap.auth.dependencies import require_permissions
from vibestrap.auth.policy import Permission
from vibestrap.auth.schemas import CurrentUser
from vibestrap.core.errors import ErrorResponse
from vibestrap.core.pagination import Page, Pagination
from vibestrap.db.session import DatabaseSession
from vibestrap.modules.notes import service
from vibestrap.modules.notes.schemas import NoteCreate, NoteRead, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])

Reader = Annotated[CurrentUser, Depends(require_permissions(Permission.NOTES_READ))]
Writer = Annotated[CurrentUser, Depends(require_permissions(Permission.NOTES_WRITE))]

AUTH_RESPONSES: dict[int | str, dict[str, type[ErrorResponse]]] = {
    401: {"model": ErrorResponse},
    403: {"model": ErrorResponse},
}
ITEM_RESPONSES = AUTH_RESPONSES | {404: {"model": ErrorResponse}}


@router.get("", operation_id="listNotes", responses=AUTH_RESPONSES)
async def list_notes(
    user: Reader,
    session: DatabaseSession,
    page: Pagination,
    pinned: Annotated[bool | None, Query()] = None,
) -> Page[NoteRead]:
    """List the caller's notes, newest first."""
    notes, total = await service.list_notes(session, user.id, page, pinned=pinned)
    return Page(
        items=[NoteRead.model_validate(note) for note in notes],
        total=total,
        limit=page.limit,
        offset=page.offset,
    )


@router.post(
    "",
    operation_id="createNote",
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
)
async def create_note(user: Writer, session: DatabaseSession, data: NoteCreate) -> NoteRead:
    note = await service.create_note(session, user.id, data)
    return NoteRead.model_validate(note)


@router.get("/{note_id}", operation_id="getNote", responses=ITEM_RESPONSES)
async def get_note(user: Reader, session: DatabaseSession, note_id: UUID) -> NoteRead:
    note = await service.get_note(session, user.id, note_id)
    return NoteRead.model_validate(note)


@router.patch("/{note_id}", operation_id="updateNote", responses=ITEM_RESPONSES)
async def update_note(
    user: Writer, session: DatabaseSession, note_id: UUID, data: NoteUpdate
) -> NoteRead:
    note = await service.update_note(session, user.id, note_id, data)
    return NoteRead.model_validate(note)


@router.delete(
    "/{note_id}",
    operation_id="deleteNote",
    status_code=status.HTTP_204_NO_CONTENT,
    responses=ITEM_RESPONSES,
)
async def delete_note(user: Writer, session: DatabaseSession, note_id: UUID) -> None:
    await service.delete_note(session, user.id, note_id)
