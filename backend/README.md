# Todo App Backend

A FastAPI backend for the Todo Web Application with JWT-authenticated endpoints, per-user task isolation, and an AI chatbot powered by Google Gemini.

## Tech Stack

- **Python 3.11+**
- **FastAPI** web framework
- **SQLModel** (SQLAlchemy + Pydantic) ORM
- **PyJWT** with JWKS verification (EdDSA/Ed25519)
- **Google Gemini 2.5 Flash** via `google-genai` SDK
- **MCP** (Model Context Protocol) for AI tool integration
- **Neon Serverless PostgreSQL**
- **Uvicorn** ASGI server

## Features

- JWT-authenticated CRUD endpoints for tasks
- Per-user task isolation via `user_id` scoping
- AI chatbot with tool-calling (add/list/complete/delete/update tasks via natural language)
- In-memory rate limiting (10 requests/user/minute) on chat endpoint
- Conversation persistence (conversation + message tables)
- Cross-user access protection (403 Forbidden)
- JWKS-based token verification (no shared secret)
- CORS configured for frontend integration
- Automatic database table creation on startup

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app, CORS, routers, startup
│   ├── logging_config.py      # Logging configuration
│   ├── auth/
│   │   ├── jwt_handler.py     # JWKS client + verify_token()
│   │   └── dependencies.py    # get_current_user FastAPI dependency
│   ├── agents/
│   │   └── todo_agent.py      # Gemini agent with MCP tool bridging
│   ├── mcp/
│   │   └── todo_tools.py      # MCP server with 5 todo management tools
│   ├── models/
│   │   ├── todo_model.py      # Todo model (TodoCreate, TodoRead, TodoUpdate)
│   │   ├── conversation_model.py  # Conversation model
│   │   └── message_model.py   # Message model
│   ├── schemas/
│   │   ├── todo_schema.py     # Todo response schemas
│   │   └── chat_schema.py     # Chat request/response schemas
│   ├── database/
│   │   └── database.py        # SQLModel engine + get_session dependency
│   └── routers/
│       ├── todo_router.py     # Task CRUD routes at /{user_id}/tasks
│       └── chat_router.py     # Chat routes at /{user_id}/chat
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment variable template
├── .gitignore
├── requirements.txt           # Python dependencies
└── run_mcp_server.py          # Standalone MCP server entry point (testing)
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
| `BETTER_AUTH_URL` | Yes | Frontend URL for JWKS verification |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (for AI chatbot) |
| `DEBUG` | No | Debug mode (default: `True`) |
| `LOG_LEVEL` | No | Log level (default: `info`) |

### 4. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
API docs at `http://localhost:8000/docs`.

## API Endpoints

### Task Endpoints (require `Authorization: Bearer <jwt>`)

All task routes include `{user_id}` in the path. The backend validates that the URL `user_id` matches the JWT `sub` claim.

| Method | Route | Description | Response |
|--------|-------|-------------|----------|
| `GET` | `/api/{user_id}/tasks` | List user's tasks | `200` with task array |
| `POST` | `/api/{user_id}/tasks` | Create a task | `201` with created task |
| `GET` | `/api/{user_id}/tasks/{id}` | Get a specific task | `200` with task |
| `PUT` | `/api/{user_id}/tasks/{id}` | Update a task | `200` with updated task |
| `PATCH` | `/api/{user_id}/tasks/{id}/complete` | Toggle completion | `200` with updated task |
| `DELETE` | `/api/{user_id}/tasks/{id}` | Delete a task | `204` no content |

### Chat Endpoints (require `Authorization: Bearer <jwt>`)

| Method | Route | Description | Response |
|--------|-------|-------------|----------|
| `POST` | `/api/{user_id}/chat` | Send a message to the AI assistant | `200` with `ChatResponse` |
| `GET` | `/api/{user_id}/chat/history` | Get most recent conversation history | `200` with `ChatHistoryResponse` |

**Rate limit**: 10 requests per user per 60 seconds on `POST /chat`. Returns `429` if exceeded.

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
| `404` | Not Found | Task/conversation doesn't exist or doesn't belong to user |
| `422` | Validation Error | Invalid request body |
| `429` | Too Many Requests | Chat rate limit exceeded |
| `503` | Service Unavailable | AI service (Gemini) temporarily down |

## Authentication

The backend does **not** manage users or sessions. It verifies JWTs issued by the frontend's Better Auth instance.

1. Frontend issues a JWT signed with EdDSA (Ed25519) via Better Auth
2. Frontend sends `Authorization: Bearer <token>` with each API request
3. Backend fetches the public key from `{BETTER_AUTH_URL}/api/auth/jwks`
4. Backend verifies the JWT signature, expiry, issuer, and audience using `PyJWKClient`
5. Backend extracts `sub` (user ID) and uses it for query scoping

## AI Chatbot Architecture

The chatbot uses **Google Gemini 2.5 Flash** with MCP tool integration:

1. User sends a message via `POST /api/{user_id}/chat`
2. Backend spawns the MCP tool server (`todo_tools.py`) as a subprocess
3. MCP tools are discovered and converted to Gemini function declarations
4. Gemini generates a response, optionally calling tools (add/list/complete/delete/update tasks)
5. Tool results are fed back to Gemini for the final natural-language response
6. Conversation history (last 20 messages) provides context for follow-up questions

## Data Model

### Todo Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer (PK) | Task ID |
| `title` | varchar(255) | Task title |
| `description` | varchar(1000) | Task description (nullable) |
| `completed` | boolean | Completion status |
| `user_id` | text (indexed) | Owner's user ID |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

### Conversation Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Conversation ID |
| `user_id` | text | Owner's user ID |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

### Message Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Message ID |
| `conversation_id` | UUID (FK) | Parent conversation |
| `user_id` | text | Owner's user ID |
| `role` | text | `user` or `assistant` |
| `content` | text | Message content |
| `created_at` | timestamp | Creation time |

## CORS Configuration

| Setting | Value |
|---------|-------|
| Allowed Origins | `http://localhost:3000`, `http://127.0.0.1:3000` |
| Allowed Methods | GET, POST, PUT, PATCH, DELETE, OPTIONS |
| Allowed Headers | `*` (including `Authorization`) |
| Allow Credentials | `true` |

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 on all requests | JWKS endpoint unreachable | Ensure frontend is running on port 3000 |
| `EdDSA not supported` | Missing `cryptography` | `pip install "PyJWT[crypto]"` |
| Database connection error | Wrong `DATABASE_URL` | Verify connection string in `.env` |
| CORS errors from browser | Origin not allowed | Check `allow_origins` in `main.py` |
| Chat returns 503 | Gemini API issue | Check `GEMINI_API_KEY` is set and valid |
| Chat returns 429 | Rate limit exceeded | Wait 60 seconds before retrying |
