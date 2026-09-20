from pydantic import BaseModel, ConfigDict, Field

from vibestrap.auth.policy import Permission, Role


class TokenIdentity(BaseModel):
    model_config = ConfigDict(strict=True)

    id: str = Field(min_length=1)
    session_id: str = Field(min_length=1)


class CurrentUser(BaseModel):
    model_config = ConfigDict(strict=True)

    id: str = Field(min_length=1, description="Better Auth user ID (JWT subject)")
    email: str | None = None
    name: str | None = None
    role: Role
    permissions: list[Permission]


class AccessPolicy(BaseModel):
    roles: dict[Role, list[Permission]]
