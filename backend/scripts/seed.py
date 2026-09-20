"""Seed demo rows for the application schema. Local development only.

Accounts belong to Better Auth (`bun run seed` creates them); this only adds business data
for an existing account, looked up read-only in the `auth` schema.
"""

import argparse
import asyncio

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import async_sessionmaker

from vibestrap.core.config import Settings
from vibestrap.db.session import create_engine
from vibestrap.modules.notes.models import Note

DEMO_NOTES = [
    ("Каждое воскресенье", "Обзор недели и планы на следующую.", True),
    ("Идеи для демо", "Собрать сценарий показа на три минуты.", False),
    ("Технический долг", "Вынести общий фильтр в сервис.", False),
]


async def seed(email: str) -> None:
    engine = create_engine(Settings())
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    try:
        async with session_factory() as session:
            owner_id = await session.scalar(
                text('SELECT id FROM auth."user" WHERE email = :email'), {"email": email}
            )
            if owner_id is None:
                raise SystemExit(
                    f"No account {email}. Run `bun run seed` from the repository root first."
                )
            existing = await session.scalar(
                select(Note.id).where(Note.owner_id == owner_id).limit(1)
            )
            if existing is not None:
                print(f"{email} already has notes; nothing to seed.")
                return
            session.add_all(
                Note(owner_id=owner_id, title=title, body=body, pinned=pinned)
                for title, body, pinned in DEMO_NOTES
            )
            await session.commit()
            print(f"Added {len(DEMO_NOTES)} demo notes for {email}.")
    finally:
        await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", default="user@vibestrap.local")
    asyncio.run(seed(parser.parse_args().email))


if __name__ == "__main__":
    main()
