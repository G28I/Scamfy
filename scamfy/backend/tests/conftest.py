import os
from collections.abc import AsyncGenerator

import pytest_asyncio
from backend.app.models import Base
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Test Database URL (Defaults to local PostgreSQL test database)
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/scamfy_test",
)


@pytest_asyncio.fixture(scope="function")
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Function-scoped async PostgreSQL engine using NullPool for isolated, clean connection lifecycle."""
    import asyncpg

    try:
        root_conn = await asyncpg.connect("postgresql://postgres:postgres@localhost:5432/postgres")
        exists = await root_conn.fetchval("SELECT 1 FROM pg_database WHERE datname = 'scamfy_test'")
        if not exists:
            await root_conn.execute("CREATE DATABASE scamfy_test")
        await root_conn.close()
    except Exception:
        pass

    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True,
        poolclass=pool.NullPool,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Per-test transactional async database session with automatic cleanup."""
    session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async with session_factory() as session:
        yield session
        await session.rollback()
        await session.close()
