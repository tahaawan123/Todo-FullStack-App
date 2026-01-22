from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Using the models from todo_model.py since they already serve as schemas
# This file can be used for additional schema definitions if needed
from ..models.todo_model import TodoRead, TodoCreate, TodoUpdate

class TodoToggleComplete(BaseModel):
    """
    Schema for toggling the completion status of a todo item.
    """
    completed: bool


class TodoListResponse(BaseModel):
    """
    Schema for the response when getting a list of todos.
    """
    todos: List[TodoRead]
    total_count: int


class ErrorResponse(BaseModel):
    """
    Schema for error responses.
    """
    detail: str


class SuccessResponse(BaseModel):
    """
    Schema for success responses.
    """
    message: str
    success: bool = True