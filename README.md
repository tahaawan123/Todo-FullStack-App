# Full-Stack Todo Application

A modern full-stack Todo application with multi-user authentication, built with Next.js (frontend) and FastAPI (backend) with Neon PostgreSQL. Users can register, sign in, and manage their own isolated task lists.

## Project Overview

- **Frontend**: Next.js 16+ with Better Auth (JWT authentication), React 19, TypeScript, and Tailwind CSS
- **Backend**: FastAPI with PyJWT JWKS verification, SQLModel ORM, and PostgreSQL
- **Database**: Neon Serverless PostgreSQL (shared instance, separate table ownership)
- **Auth**: Asymmetric JWT (EdDSA/Ed25519) via Better Auth with JWKS-based backend verification

## Tech Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Auth**: Better Auth with JWT plugin (EdDSA signing)
- **Database ORM**: Drizzle ORM (for auth tables only)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLModel (for todo table)
- **Auth**: PyJWT with JWKS verification
- **Database**: Neon Serverless PostgreSQL
- **ASGI Server**: Uvicorn

## Architecture

```
Browser --> Next.js (port 3000) --> Better Auth (session + JWT)
                |                         |
                |                    Neon PostgreSQL
                |                    (user, session, account, jwks tables)
                |
                +--> FastAPI (port 8000) --> JWT verification via JWKS
                                      |
                                 Neon PostgreSQL
                                 (todo table with user_id)
```

**Auth flow**: Better Auth manages user registration, sessions, and JWT issuance on the frontend. The backend verifies JWTs by fetching public keys from the frontend's `/api/auth/jwks` endpoint. Tasks are scoped per user via `user_id` on every query.

## Folder Structure

```
todo_fullstack_app/
├── backend/                  # FastAPI backend application
│   ├── app/
│   │   ├── main.py          # FastAPI app with CORS configuration
│   │   ├── auth/            # JWT verification module
│   │   │   ├── jwt_handler.py    # JWKS client + token verification
│   │   │   └── dependencies.py   # get_current_user FastAPI dependency
│   │   ├── models/          # SQLModel database models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── database/        # Database connection and session
│   │   ├── routers/         # API route definitions
│   │   └── exceptions.py    # Custom exception handlers
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (gitignored)
│   ├── .env.example         # Environment variable template
│   └── README.md            # Backend documentation
├── frontend/                 # Next.js frontend application
│   ├── app/
│   │   ├── page.tsx         # Dashboard (server-side auth check)
│   │   ├── signin/          # Sign-in page
│   │   ├── signup/          # Sign-up page
│   │   └── api/auth/        # Better Auth catch-all route handler
│   ├── components/
│   │   ├── auth/            # AuthProvider, SignInForm, SignUpForm
│   │   ├── layout/          # Header (with sign-out), Container
│   │   ├── todo/            # TodoForm, TodoList, TodoItem, etc.
│   │   └── ui/              # Reusable UI components
│   ├── db/                  # Drizzle ORM connection and schema
│   ├── drizzle/             # Database migration files
│   ├── lib/
│   │   ├── auth.ts          # Better Auth server instance
│   │   ├── auth-client.ts   # Better Auth client instance
│   │   ├── api.ts           # Authenticated fetch utility
│   │   ├── hooks/           # React hooks (useTodos)
│   │   ├── services/        # API service layer (todoService)
│   │   └── types/           # TypeScript type definitions
│   ├── middleware.ts         # Route protection (session cookie check)
│   ├── drizzle.config.ts    # Drizzle Kit configuration
│   ├── package.json         # Node.js dependencies
│   ├── .env.local           # Environment variables (gitignored)
│   ├── .env.example         # Environment variable template
│   └── README.md            # Frontend documentation
├── specs/                    # Feature specifications
├── history/                  # Prompt history records
├── .specify/                 # SpecKit Plus templates and scripts
├── CLAUDE.md                # Claude Code rules
└── README.md                # This file
```

## API Endpoints

### Authenticated Task Endpoints (require JWT Bearer token)

All task endpoints use the pattern `/api/{user_id}/tasks`. The `user_id` in the URL must match the JWT `sub` claim.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/{user_id}/tasks` | List all tasks for the user |
| `POST` | `/api/{user_id}/tasks` | Create a new task |
| `GET` | `/api/{user_id}/tasks/{id}` | Get a specific task |
| `PUT` | `/api/{user_id}/tasks/{id}` | Update a task |
| `PATCH` | `/api/{user_id}/tasks/{id}/complete` | Toggle completion status |
| `DELETE` | `/api/{user_id}/tasks/{id}` | Delete a task |

### Public Endpoints (no authentication required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/` | Root endpoint |

### Auth Endpoints (handled by Better Auth on frontend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/sign-up/email` | Register a new user |
| `POST` | `/api/auth/sign-in/email` | Sign in |
| `POST` | `/api/auth/sign-out` | Sign out |
| `GET` | `/api/auth/get-session` | Check session |
| `GET` | `/api/auth/token` | Get JWT bearer token |
| `GET` | `/api/auth/jwks` | Public keys for JWT verification |

### Data Model

**Task**:
- `id`: Unique identifier (integer, auto-generated)
- `title`: Task title (string, 1-255 chars, required)
- `description`: Task description (string, max 1000 chars, optional)
- `completed`: Completion status (boolean, default: false)
- `user_id`: Owner's user ID (string, from JWT `sub` claim)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Secret for session encryption (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Frontend URL (`http://localhost:3000`) |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend API URL (`http://localhost:8000`) |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_URL` | Yes | Frontend URL for JWKS verification |
| `DEBUG` | No | Debug mode (default: True) |
| `LOG_LEVEL` | No | Log level (default: info) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Access to a Neon PostgreSQL instance

### 1. Clone and configure

```bash
# Copy environment templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit both files with your actual values
```

### 2. Set up the frontend

```bash
cd frontend
npm install

# Generate a secret for Better Auth
openssl rand -base64 32
# Add the output to BETTER_AUTH_URL in .env.local

# Run database migrations (creates auth tables)
npx drizzle-kit migrate
```

### 3. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 4. Start both servers

```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Use the app

1. Open `http://localhost:3000`
2. You'll be redirected to `/signin`
3. Click "Sign up" to create an account
4. Sign in with your credentials
5. Create and manage your tasks

## Security

- **JWT**: Asymmetric EdDSA (Ed25519) signing — no shared secret between services
- **JWKS**: Backend verifies tokens via public key endpoint with automatic key caching
- **User isolation**: All task queries scoped by `user_id` from JWT `sub` claim
- **Cross-user protection**: URL `user_id` validated against JWT — mismatch returns 403
- **Route protection**: Next.js middleware redirects unauthenticated users to `/signin`
- **No secrets in code**: All credentials via `.env` files, gitignored by default

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 on all backend requests | JWKS endpoint unreachable | Ensure frontend is running on port 3000 |
| CORS errors in browser | Backend CORS misconfigured | Verify `http://localhost:3000` is in allowed origins |
| `Table "user" does not exist` | Migrations not run | Run `npx drizzle-kit migrate` from frontend dir |
| `EdDSA not supported` | Missing `cryptography` package | Install `PyJWT[crypto]` (with the `[crypto]` extra) |
| Redirect loop on `/` | No session cookie | Clear cookies and sign in again |

## License

MIT License - See LICENSE file for details.
