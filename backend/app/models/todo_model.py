from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class TodoBase(SQLModel):
    """
    Base class for Todo model containing shared attributes.
    """
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)


class Todo(TodoBase, table=True):
    """
    Todo model representing a todo item in the database.

    Attributes:
        id: Unique identifier for the todo item (auto-generated)
        title: The main title/description of the todo item (required, max 255 chars)
        description: Detailed description of the todo item (optional, max 1000 chars)
        completed: Status indicating whether the todo is completed (default: False)
        created_at: Timestamp when the todo was created (auto-generated)
        updated_at: Timestamp when the todo was last updated (auto-generated)
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TodoCreate(TodoBase):
    """
    Model for creating a new todo item.
    Inherits all fields from TodoBase.
    """
    pass


class TodoRead(TodoBase):
    """
    Model for reading a todo item with its ID.
    """
    id: int
    created_at: datetime
    updated_at: datetime


class TodoUpdate(SQLModel):
    """
    Model for updating a todo item.
    All fields are optional for partial updates.
    """
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = Field(default=None)