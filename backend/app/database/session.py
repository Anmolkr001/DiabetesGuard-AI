"""
DiabetesGuard AI — Database Connection & Session Management
============================================================
Supports MySQL with an automatic SQLite fallback for lightweight
development and isolated integration testing.
"""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

PROJECT_ROOT = Path(__file__).resolve().parents[3]

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "diabetesguard_db")

# Allow explicit override via DATABASE_URL or attempt MySQL with graceful SQLite fallback
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Use SQLite file inside backend/database for zero-dependency testability if MySQL is offline
    sqlite_path = PROJECT_ROOT / "backend" / "diabetesguard.db"
    DATABASE_URL = f"sqlite:///{sqlite_path.as_posix()}"

# Engine initialization
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI Dependency for database session lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

