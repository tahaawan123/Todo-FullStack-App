# Todo App Backend

A FastAPI backend for the Todo Web Application with JWT-authenticated endpoints and per-user task isolation.

## Tech Stack

- **Python 3.11+**
- **FastAPI** web framework
- **SQLModel** (SQLAlchemy + Pydantic) ORM
- **PyJWT** with JWKS verification (EdDSA/Ed25519)
- **Neon Serverless PostgreSQL**
- **Uvicorn** ASGI server

## Features

- JWT-authenticated CRUD endpoints for tasks
- Per-user task isolation via `user_id` scoping
- Cross-user access protection (403 Forbidden)
- JWKS-based token verification (no shared secret)
- Unauthenticated health check endpoint
- CORS configured for frontend integration
- Automatic database table creation on startup
- Structured logging

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app, CORS, health check, root endpoint
│   ├── logging_config.py      # Logging configuration
│   ├── exceptions.py          # Custom exception handlers
│   ├── auth/                  # Authentication module
│   │   ├── __init__.py
│   │   ├── jwt_handler.py     # JWKS client + verify_token() function
│   │   └── dependencies.py    # get_current_user FastAPI dependency
│   ├── models/
│   │   ├── __init__.py
│   │   └── todo_model.py      # Todo model with user_id, TodoCreate, TodoRead, TodoUpdate
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── todo_schema.py     # TodoToggleComplete, TodoListResponse, etc.
│   ├── database/
│   │   ├── __init__.py
│   │   └── database.py        # SQLModel engine + get_session dependency
│   └── routers/
│       ├── __init__.py
│       └── todo_router.py     # Task CRUD routes at /{user_id}/tasks
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment variable template
├── .gitignore
├── requirements.txt           # Python dependencies
└── venv/                      # Virtual environment (gitignored)
```

## Setup

### 1. Create virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Linux/Mac
# or: venv\Scripts\activate  # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_URL` | Yes | Frontend URL for JWKS verification (`http://localhost:3000`) |
| `DEBUG` | No | Debug mode (default: True) |
| `LOG_LEVEL` | No | Log level (default: info) |

### 4. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
API docs at `http://localhost:8000/docs`.

## API Routes

### Authenticated Endpoints (require `Authorization: Bearer <jwt>` header)

All task routes include `{user_id}` in the path. The backend validates that the URL `user_id` matches the JWT `sub` claim.

| Method | Route | Description | Response |
|--------|-------|-------------|----------|
| `GET` | `/api/{user_id}/tasks` | List user's tasks | `200` with task array |
| `POST` | `/api/{user_id}/tasks` | Create a task | `201` with created task |
| `GET` | `/api/{user_id}/tasks/{id}` | Get a specific task | `200` with task |
| `PUT` | `/api/{user_id}/tasks/{id}` | Update a task | `200` with updated task |
| `PATCH` | `/api/{user_id}/tasks/{id}/complete` | Toggle completion | `200` with updated task |
| `DELETE` | `/api/{user_id}/tasks/{id}` | Delete a task | `204` no content |

### Public Endpoints (no authentication)

| Method | Route | Description | Response |
|--------|-------|-------------|----------|
| `GET` | `/health` | Health check | `200` `{"status": "healthy"}` |
| `GET` | `/` | Root endpoint | `200` `{"message": "Todo API is running!"}` |

### Error Responses

| Status | Meaning | When |
|--------|---------|------|
| `401` | Unauthorized | Missing, expired, or invalid JWT |
| `403` | Forbidden | URL `user_id` doesn't match JWT `sub` |
| `404` | Not Found | Task doesn't exist or doesn't belong to user |
| `422` | Validation Error | Invalid request body |

## Authentication

The backend does **not** manage users or sessions. It verifies JWTs issued by the frontend's Better Auth instance.

**How it works**:

1. Frontend issues a JWT signed with EdDSA (Ed25519) via Better Auth
2. Frontend sends `Authorization: Bearer <token>` with each API request
3. Backend fetches the public key from `{BETTER_AUTH_URL}/api/auth/jwks`
4. Backend verifies the JWT signature, expiry, issuer, and audience using `PyJWKClient`
5. Backend extracts `sub` (user ID) from the token and uses it for query scoping
6. If URL `user_id` doesn't match JWT `sub`, returns `403 Forbidden`

**Key files**:
- `app/auth/jwt_handler.py` — JWKS client and `verify_token()` function
- `app/auth/dependencies.py` — `get_current_user` FastAPI dependency (`TokenPayload` model)

## Data Model

### Todo Table (managed by SQLModel)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | integer | PK, auto-increment | Task ID |
| `title` | varchar(255) | NOT NULL, min 1 char | Task title |
| `description` | varchar(1000) | nullable | Task description |
| `completed` | boolean | NOT NULL, default false | Completion status |
| `user_id` | text | NOT NULL, indexed | Owner's user ID (from JWT `sub`) |
| `created_at` | timestamp | NOT NULL | Creation time |
| `updated_at` | timestamp | NOT NULL | Last update time |

The table is auto-created on startup via `SQLModel.metadata.create_all()`.

## CORS Configuration

| Setting | Value |
|---------|-------|
| Allowed Origins | `http://localhost:3000`, `http://127.0.0.1:3000` |
| Allowed Methods | GET, POST, PUT, PATCH, DELETE, OPTIONS |
| Allowed Headers | `*` (including `Authorization`) |
| Allow Credentials | `true` |
| Max Age | 600 seconds |

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 on all requests | JWKS endpoint unreachable | Ensure frontend is running on port 3000 |
| `EdDSA not supported` | Missing `cryptography` | Reinstall with `pip install "PyJWT[crypto]"` |
| `Column "user_id" does not exist` | Old table schema | Drop and recreate the `todo` table |
| Database connection error | Wrong `DATABASE_URL` | Verify connection string in `.env` |
| CORS errors from browser | Origin not allowed | Check `allow_origins` in `main.py` |
