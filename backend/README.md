# Todo App Backend

A robust Todo API built with FastAPI and SQLModel for the Todo Web Application.

## Features

- Full CRUD operations for todo items
- RESTful API endpoints with proper HTTP status codes
- Data validation using Pydantic models
- PostgreSQL database with SQLModel ORM
- CORS enabled for frontend integration
- Comprehensive error handling
- Structured logging support
- Automatic API documentation via Swagger UI

## Tech Stack

- Python 3.8+
- FastAPI
- SQLModel
- PostgreSQL (compatible with Neon and other providers)
- Uvicorn ASGI server
- Pydantic for data validation
- python-dotenv for environment management

## Virtual Environment Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv .venv
```

3. Activate the virtual environment:
```bash
# On Linux/Mac:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
DEBUG=True
LOG_LEVEL=info
```

## Running the Application

1. Ensure your virtual environment is activated
2. Run the application using uvicorn:
```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

API documentation will be available at `http://localhost:8000/docs`.

## API Routes

- `POST /api/todos` - Create a new todo
- `GET /api/todos` - Get all todos
- `GET /api/todos/{id}` - Get a specific todo
- `PUT /api/todos/{id}` - Update a todo
- `PATCH /api/todos/{id}/complete` - Toggle completion status
- `DELETE /api/todos/{id}` - Delete a todo
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint

## Database Information

- Uses SQLModel (SQLAlchemy + Pydantic) for ORM operations
- Automatically creates database tables on startup
- Compatible with PostgreSQL databases
- Supports Neon, AWS RDS, Google Cloud SQL, and local PostgreSQL installations

## CORS Configuration

The backend is configured to accept requests from common frontend origins:
- `http://localhost:3000` (Next.js default)
- `http://127.0.0.1:3000`
- `http://localhost:3001` (alternative Next.js port)
- `http://127.0.0.1:3001`
- `http://localhost:8000` (same-origin)
- `http://127.0.0.1:8000`
- `https://localhost:3000` (HTTPS versions)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Main FastAPI application with CORS configuration
│   ├── logging_config.py    # Logging configuration
│   ├── models/              # Database models (SQLModel)
│   │   ├── __init__.py
│   │   └── todo_model.py    # Todo SQLAlchemy model with Pydantic schemas
│   ├── schemas/             # Pydantic schemas for API validation
│   │   ├── __init__.py
│   │   └── todo_schema.py
│   ├── database/            # Database connection and session management
│   │   ├── __init__.py
│   │   └── database.py
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   └── todo_router.py   # Todo-specific API endpoints
│   └── exceptions.py        # Custom exception handlers
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── requirements.txt         # Project dependencies
├── test_main.py             # Test file
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
└── .venv/                   # Python virtual environment
```

## Testing

To run the tests:
```bash
cd backend
pytest
```

## Deployment

The application is designed for easy deployment to cloud platforms:
- Heroku
- AWS
- Google Cloud
- Railway
- Docker containers

## Security Considerations

- Input validation through Pydantic models
- Parameterized queries via SQLModel prevent SQL injection
- CORS configuration limits allowed origins
- Proper error handling prevents information disclosure

## Common Issues & Troubleshooting

1. **Database Connection Issues**: Verify DATABASE_URL is correctly configured in `.env`
2. **CORS Errors**: Check that your frontend origin is included in the CORS middleware
3. **Virtual Environment**: Ensure your virtual environment is activated before running the app
4. **Port Conflicts**: Change the port if 8000 is already in use (`uvicorn app.main:app --host 0.0.0.0 --port 8001`)