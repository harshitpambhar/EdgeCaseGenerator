"""
Database configuration using SQLAlchemy.
Supports SQLite (for default local development) and PostgreSQL.
"""
from __future__ import annotations

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Default to local SQLite database if no database URL is set
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./edgecase_generator.db")

# For SQLite, specify connect_args to allow multithreading
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency for accessing the database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
