from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Annotated, List
from ..database.database import get_session
from ..models.todo_model import Todo, TodoCreate, TodoRead, TodoUpdate
from ..schemas.todo_schema import TodoToggleComplete
from ..exceptions import TodoNotFoundException
from ..auth.dependencies import get_current_user, TokenPayload

router = APIRouter()


def _verify_user_access(user_id: str, current_user: TokenPayload) -> None:
    if user_id != current_user.sub:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's resources",
        )


@router.post("/{user_id}/tasks", response_model=TodoRead, status_code=201)
def create_todo(
    user_id: str,
    todo: TodoCreate,
    current_user: Annotated[TokenPayload, Depends(get_current_user)],
    session: Session = Depends(get_session),
) -> TodoRead:
    _verify_user_access(user_id, current_user)
    todo_data = todo.model_dump()
    db_todo = Todo(**todo_data, user_id=current_user.sub)
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo


@router.get("/{user_id}/tasks", response_model=List[TodoRead])
def read_todos(
    user_id: str,
    current_user: Annotated[TokenPayload, Depends(get_current_user)],
    session: Session = Depends(get_session),
) -> List[TodoRead]:
    _verify_user_access(user_id, current_user)
    statement = select(Todo).where(Todo.user_id == current_user.sub)
    todos = session.exec(statement).all()
    return todos


@router.get("/{user_id}/tasks/{todo_id}", response_model=TodoRead)
def read_todo(
    user_id: str,
    todo_id: int,
    current_user: Annotated[TokenPayload, Depends(get_current_user)],
    session: Session = Depends(get_session),
) -> TodoRead:
    _verify_user_access(user_id, current_user)
    statement = select(Todo).where(Todo.id == todo_id, Todo.user_id == current_user.sub)
    todo = session.exec(statement).first()
    if not todo:
        raise TodoNotFoundException(todo_id)
    return todo


@router.put("/{user_id}/tasks/{todo_id}", response_model=TodoRead)
def update_todo(
    user_id: str,
    todo_id: int,
    todo: TodoUpdate,
    current_user: Annotated[TokenPayload, Depends(get_current_user)],
    session: Session = Depends(get_session),
) -> TodoRead:
    _verify_user_access(user_id, current_user)
    statement = select(Todo).where(Todo.id == todo_id, Todo.user_id == current_user.sub)
    db_todo = session.exec(statement).first()
    if not db_todo:
        raise TodoNotFoundException(todo_id)
    update_data = todo.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_todo, key, value)
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo


@router.patch("/{user_id}/tasks/{todo_id}/complete", response_model=TodoRead)
def toggle_todo_completion(
    user_id: str,
    todo_id: int,
    toggle_data: TodoToggleComplete,
    current_user: Annotated[TokenPayload, Depends(get_current_user)],
    session: Session = Depends(get_session),
) -> TodoRead:
    _verify_user_access(user_id, current_user)
    statement = select(Todo).where(Todo.id == todo_id, Todo.user_id == current_user.sub)
    db_todo = session.exec(statement).first()
    if not db_todo:
        raise TodoNotFoundException(todo_id)
    db_todo.completed = toggle_data.completed
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo


@router.delete("/{user_id}/tasks/{todo_id}", status_code=204)
def delete_todo(
    user_id: str,
    todo_id: int,
    current_user: Annotated[TokenPayload, Depends(get_current_user)],
    session: Session = Depends(get_session),
):
    _verify_user_access(user_id, current_user)
    statement = select(Todo).where(Todo.id == todo_id, Todo.user_id == current_user.sub)
    todo = session.exec(statement).first()
    if not todo:
        raise TodoNotFoundException(todo_id)
    session.delete(todo)
    session.commit()
