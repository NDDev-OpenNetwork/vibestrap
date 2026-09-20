"""Reference endpoint tests: copy this shape for a new domain module."""

import pytest

from vibestrap.auth.policy import Role, permissions_for

pytestmark = pytest.mark.integration


async def test_notes_lifecycle(api_client):
    created = await api_client.post("/api/v1/notes", json={"title": "First", "body": "Body"})
    assert created.status_code == 201
    note = created.json()

    listed = await api_client.get("/api/v1/notes")
    assert listed.status_code == 200
    assert listed.json()["total"] == 1

    patched = await api_client.patch(f"/api/v1/notes/{note['id']}", json={"pinned": True})
    assert patched.status_code == 200
    assert patched.json()["pinned"] is True

    assert (await api_client.get("/api/v1/notes", params={"pinned": False})).json()["total"] == 0
    assert (await api_client.delete(f"/api/v1/notes/{note['id']}")).status_code == 204
    assert (await api_client.get(f"/api/v1/notes/{note['id']}")).status_code == 404


async def test_notes_are_private_to_their_owner(api_client, make_api_client, make_user):
    note = (await api_client.post("/api/v1/notes", json={"title": "Private"})).json()
    stranger = make_api_client(make_user(Role.USER, "someone-else"))

    assert (await stranger.get("/api/v1/notes")).json()["total"] == 0
    assert (await stranger.get(f"/api/v1/notes/{note['id']}")).status_code == 404
    assert (
        await stranger.patch(f"/api/v1/notes/{note['id']}", json={"title": "Stolen"})
    ).status_code == 404
    assert (await stranger.delete(f"/api/v1/notes/{note['id']}")).status_code == 404


async def test_patch_rejects_null_for_a_required_column(api_client):
    note = (await api_client.post("/api/v1/notes", json={"title": "Keeps its title"})).json()

    response = await api_client.patch(f"/api/v1/notes/{note['id']}", json={"title": None})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"

    # A nullable column can still be cleared.
    cleared = await api_client.patch(f"/api/v1/notes/{note['id']}", json={"body": None})
    assert cleared.status_code == 200
    assert cleared.json()["body"] is None


def test_every_role_may_use_notes():
    for role in Role:
        assert "notes:write" in permissions_for(role)
