from sqlmodel import create_engine, Session
from typing import Generator
import os
from contextlib import contextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")

# Create the database engine
engine = create_engine(DATABASE_URL, echo=False)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency function that provides a database session for FastAPI endpoints.

    Yields:
        Session: A SQLModel database session
    """
    with Session(engine) as session:
        yield session

@contextmanager
def get_db_context():
    """
    Context manager for getting a database session for use outside of FastAPI dependencies.

    Usage:
        with get_db_context() as db:
            # Perform database operations
            pass
    """
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()