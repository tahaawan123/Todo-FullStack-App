from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database.database import get_session
from ..models.todo_model import Todo, TodoCreate, TodoRead, TodoUpdate
from ..schemas.todo_schema import TodoToggleComplete, TodoListResponse
from ..exceptions import TodoNotFoundException, DatabaseErrorException

router = APIRouter()

@router.post("/todos", response_model=TodoRead, status_code=201)
def create_todo(todo: TodoCreate, session: Session = Depends(get_session)) -> TodoRead:
    """
    Create a new todo item.

    Args:
        todo: The todo item to create
        session: Database session dependency

    Returns:
        TodoRead: The created todo item with its ID and timestamps
    """
    # Create a new Todo instance from the input data
    # Handle both Pydantic v1 (.dict()) and v2 (.model_dump()) methods
    if hasattr(todo, 'model_dump'):
        todo_data = todo.model_dump()
    elif hasattr(todo, 'dict'):
        todo_data = todo.dict()
    else:
        # Fallback: manually extract the fields
        todo_data = {}
        for field_name in TodoCreate.__annotations__:
            if hasattr(todo, field_name):
                todo_data[field_name] = getattr(todo, field_name)

    db_todo = Todo(**todo_data)

    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)

    return db_todo

@router.get("/todos", response_model=List[TodoRead])
def read_todos(session: Session = Depends(get_session)) -> List[TodoRead]:
    """
    Get all todo items.

    Args:
        session: Database session dependency

    Returns:
        List[TodoRead]: List of all todo items
    """
    statement = select(Todo)
    todos = session.exec(statement).all()
    return todos

@router.get("/todos/{todo_id}", response_model=TodoRead)
def read_todo(todo_id: int, session: Session = Depends(get_session)) -> TodoRead:
    """
    Get a specific todo item by ID.

    Args:
        todo_id: ID of the todo item to retrieve
        session: Database session dependency

    Returns:
        TodoRead: The requested todo item

    Raises:
        TodoNotFoundException: If the todo item is not found (404)
    """
    statement = select(Todo).where(Todo.id == todo_id)
    todo = session.exec(statement).first()
    if not todo:
        raise TodoNotFoundException(todo_id)
    return todo

@router.put("/todos/{todo_id}", response_model=TodoRead)
def update_todo(todo_id: int, todo: TodoUpdate, session: Session = Depends(get_session)) -> TodoRead:
    """
    Update a specific todo item by ID.

    Args:
        todo_id: ID of the todo item to update
        todo: Updated todo data
        session: Database session dependency

    Returns:
        TodoRead: The updated todo item

    Raises:
        TodoNotFoundException: If the todo item is not found (404)
    """
    statement = select(Todo).where(Todo.id == todo_id)
    db_todo = session.exec(statement).first()
    if not db_todo:
        raise TodoNotFoundException(todo_id)

    # Update the todo with the provided data, handling Pydantic v1/v2 compatibility
    # and excluding unset fields (equivalent to exclude_unset=True)
    if hasattr(todo, 'model_dump'):
        update_data = todo.model_dump(exclude_unset=True)
    elif hasattr(todo, 'dict'):
        update_data = todo.dict(exclude_unset=True)
    else:
        # Manual extraction that only includes fields that were actually provided
        update_data = {}
        for field_name in TodoUpdate.__annotations__:
            if hasattr(todo, field_name) and getattr(todo, field_name) is not None:
                # Check if the field was provided in the request (not None/default)
                attr_value = getattr(todo, field_name)
                # Only include the field if it's not the default value for optional fields
                update_data[field_name] = attr_value

    for key, value in update_data.items():
        setattr(db_todo, key, value)

    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo

@router.patch("/todos/{todo_id}/complete", response_model=TodoRead)
def toggle_todo_completion(todo_id: int, toggle_data: TodoToggleComplete, session: Session = Depends(get_session)) -> TodoRead:
    """
    Toggle the completion status of a specific todo item by ID.

    Args:
        todo_id: ID of the todo item to toggle
        toggle_data: Object containing the completed status
        session: Database session dependency

    Returns:
        TodoRead: The updated todo item with the new completion status

    Raises:
        TodoNotFoundException: If the todo item is not found (404)
    """
    statement = select(Todo).where(Todo.id == todo_id)
    db_todo = session.exec(statement).first()
    if not db_todo:
        raise TodoNotFoundException(todo_id)

    db_todo.completed = toggle_data.completed
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, session: Session = Depends(get_session)):
    """
    Delete a specific todo item by ID.

    Args:
        todo_id: ID of the todo item to delete
        session: Database session dependency

    Returns:
        dict: Success message

    Raises:
        TodoNotFoundException: If the todo item is not found (404)
    """
    statement = select(Todo).where(Todo.id == todo_id)
    todo = session.exec(statement).first()
    if not todo:
        raise TodoNotFoundException(todo_id)

    session.delete(todo)
    session.commit()
    return {"message": "Todo deleted successfully"}