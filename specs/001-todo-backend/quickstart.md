# Quickstart Guide: Todo App Backend

## Prerequisites
- Python 3.8 or higher
- pip package manager
- Access to Neon PostgreSQL database
- Virtual environment tool (built into Python 3.3+)

## Setup Instructions

### 1. Clone and Navigate to Project
```bash
# Navigate to your project directory
cd /path/to/todo-backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
```bash
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 4. Install Dependencies
```bash
pip install fastapi uvicorn sqlmodel python-dotenv psycopg2-binary
```

### 5. Configure Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
```

### 6. Project Structure
```
todo-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Main FastAPI application
│   ├── models/              # Database models (SQLModel)
│   │   ├── __init__.py
│   │   └── todo_model.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   └── todo_schema.py
│   ├── database/            # Database connection
│   │   ├── __init__.py
│   │   └── database.py
│   └── routers/             # API routes
│       ├── __init__.py
│       └── todo_router.py
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
└── requirements.txt         # Project dependencies
```

### 7. Run the Application
```bash
# Run with uvicorn
uvicorn app.main:app --reload

# Or specify host and port
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 8. Verify Installation
- Visit `http://localhost:8000` to check if the server is running
- Visit `http://localhost:8000/docs` for interactive API documentation

## Available Endpoints
- `POST /api/todos` - Create a new todo
- `GET /api/todos` - Get all todos
- `GET /api/todos/{id}` - Get a specific todo
- `PUT /api/todos/{id}` - Update a todo
- `PATCH /api/todos/{id}/complete` - Toggle todo completion status
- `DELETE /api/todos/{id}` - Delete a todo

## Development Commands
```bash
# Run tests (when implemented)
python -m pytest

# Format code
black .

# Lint code
flake8 .
```