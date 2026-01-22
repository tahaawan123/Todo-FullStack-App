import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool
from app.main import app
from app.database.database import get_session
from app.models.todo_model import Todo

# Create a test database engine using SQLite in memory
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

def get_test_session():
    """Override the get_session dependency for testing."""
    with Session(engine) as session:
        yield session

# Override the get_session dependency with the test session

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(bind=engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session):
    # Override the dependency
    app.dependency_overrides[get_session] = lambda: session
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_create_todo(client: TestClient):
    """Test creating a new todo."""
    response = client.post(
        "/api/todos",
        json={"title": "Test todo", "description": "Test description", "completed": False}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test todo"
    assert data["description"] == "Test description"
    assert data["completed"] is False
    assert "id" in data

def test_get_todos(client: TestClient):
    """Test getting all todos."""
    # First create a todo
    client.post(
        "/api/todos",
        json={"title": "Test todo", "description": "Test description", "completed": False}
    )

    response = client.get("/api/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_get_single_todo(client: TestClient, session):
    """Test getting a single todo."""
    # Create a todo in the database
    todo = Todo(title="Test todo", description="Test description", completed=False)
    session.add(todo)
    session.commit()
    session.refresh(todo)

    response = client.get(f"/api/todos/{todo.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == todo.id
    assert data["title"] == "Test todo"

def test_update_todo(client: TestClient, session):
    """Test updating a todo."""
    # Create a todo in the database
    todo = Todo(title="Test todo", description="Test description", completed=False)
    session.add(todo)
    session.commit()
    session.refresh(todo)

    response = client.put(
        f"/api/todos/{todo.id}",
        json={"title": "Updated todo", "completed": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated todo"
    assert data["completed"] is True

def test_toggle_todo_completion(client: TestClient, session):
    """Test toggling todo completion status."""
    # Create a todo in the database
    todo = Todo(title="Test todo", description="Test description", completed=False)
    session.add(todo)
    session.commit()
    session.refresh(todo)

    response = client.patch(
        f"/api/todos/{todo.id}/complete",
        json={"completed": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True

def test_delete_todo(client: TestClient, session):
    """Test deleting a todo."""
    # Create a todo in the database
    todo = Todo(title="Test todo", description="Test description", completed=False)
    session.add(todo)
    session.commit()
    session.refresh(todo)

    response = client.delete(f"/api/todos/{todo.id}")
    assert response.status_code == 200

    # Verify the todo is deleted
    response = client.get(f"/api/todos/{todo.id}")
    assert response.status_code == 404