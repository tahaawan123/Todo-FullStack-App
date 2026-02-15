"""
MCP Server with 5 todo management tools.

Runs as a subprocess spawned by MCPServerStdio in todo_agent.py.
Uses FastMCP from the mcp SDK for decorator-based tool definitions.

CRITICAL: Never print() to stdout — it corrupts JSON-RPC over stdio transport.
"""

import json
import logging
import os
import sys

# Add backend root to path so imports work when run as subprocess
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from mcp.server.fastmcp import FastMCP
from sqlmodel import select
from datetime import datetime

from app.database.database import get_db_context
from app.models.todo_model import Todo

logger = logging.getLogger(__name__)

mcp = FastMCP("todo-tools")


@mcp.tool()
def add_task(user_id: str, title: str, description: str = "") -> str:
    """Add a new task for the user. Returns the created task as JSON."""
    try:
        with get_db_context() as db:
            todo = Todo(
                user_id=user_id,
                title=title,
                description=description or None,
            )
            db.add(todo)
            db.flush()
            db.refresh(todo)
            return json.dumps({
                "id": todo.id,
                "title": todo.title,
                "description": todo.description,
                "completed": todo.completed,
            })
    except Exception as e:
        logger.error("add_task error: %s", e, exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
def list_tasks(user_id: str) -> str:
    """List all tasks for the user. Returns a JSON array of tasks."""
    try:
        with get_db_context() as db:
            statement = select(Todo).where(Todo.user_id == user_id)
            todos = db.exec(statement).all()
            tasks = [
                {
                    "id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "completed": t.completed,
                }
                for t in todos
            ]
            return json.dumps(tasks)
    except Exception as e:
        logger.error("list_tasks error: %s", e, exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
def complete_task(user_id: str, task_id: int) -> str:
    """Mark a task as completed. Returns the updated task as JSON."""
    try:
        with get_db_context() as db:
            statement = select(Todo).where(
                Todo.id == task_id, Todo.user_id == user_id
            )
            todo = db.exec(statement).first()
            if not todo:
                return json.dumps({"error": f"Task {task_id} not found"})
            todo.completed = True
            todo.updated_at = datetime.utcnow()
            db.add(todo)
            db.flush()
            db.refresh(todo)
            return json.dumps({
                "id": todo.id,
                "title": todo.title,
                "completed": todo.completed,
            })
    except Exception as e:
        logger.error("complete_task error: %s", e, exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
def delete_task(user_id: str, task_id: int) -> str:
    """Delete a task. Returns confirmation as JSON."""
    try:
        with get_db_context() as db:
            statement = select(Todo).where(
                Todo.id == task_id, Todo.user_id == user_id
            )
            todo = db.exec(statement).first()
            if not todo:
                return json.dumps({"error": f"Task {task_id} not found"})
            title = todo.title
            db.delete(todo)
            return json.dumps({
                "deleted": True,
                "id": task_id,
                "title": title,
            })
    except Exception as e:
        logger.error("delete_task error: %s", e, exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
def update_task(
    user_id: str, task_id: int, title: str = "", description: str = ""
) -> str:
    """Update a task's title and/or description. Returns the updated task as JSON."""
    try:
        with get_db_context() as db:
            statement = select(Todo).where(
                Todo.id == task_id, Todo.user_id == user_id
            )
            todo = db.exec(statement).first()
            if not todo:
                return json.dumps({"error": f"Task {task_id} not found"})
            if title:
                todo.title = title
            if description:
                todo.description = description
            todo.updated_at = datetime.utcnow()
            db.add(todo)
            db.flush()
            db.refresh(todo)
            return json.dumps({
                "id": todo.id,
                "title": todo.title,
                "description": todo.description,
                "completed": todo.completed,
            })
    except Exception as e:
        logger.error("update_task error: %s", e, exc_info=True)
        return json.dumps({"error": str(e)})


if __name__ == "__main__":
    mcp.run()
