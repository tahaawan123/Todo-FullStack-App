# Todo App Frontend

A Next.js frontend for the Todo Web Application with multi-user authentication via Better Auth and JWT-based API access.

## Tech Stack

- **Next.js 16+** (App Router)
- **React 19** with TypeScript
- **Better Auth** with JWT plugin (EdDSA signing) and Drizzle adapter
- **Drizzle ORM** with `@neondatabase/serverless` for auth database tables
- **Tailwind CSS** for styling
- **React Hook Form** for form handling

## Features

- User registration and sign-in with email/password
- JWT-authenticated API calls to the backend
- Per-user task isolation (each user sees only their tasks)
- Route protection via Next.js middleware
- Sign-out with session cleanup
- Full CRUD operations for tasks
- Optimistic updates with error rollback
- Task filtering (all/active/completed) and search
- Dark/light theme toggle
- Responsive UI

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx               # Dashboard (server-side auth check)
│   ├── dashboard-client.tsx   # Client-side dashboard component
│   ├── layout.tsx             # Root layout with AuthProvider
│   ├── globals.css            # Global styles
│   ├── signin/
│   │   └── page.tsx           # Sign-in page
│   ├── signup/
│   │   └── page.tsx           # Sign-up page
│   └── api/auth/
│       └── [...all]/
│           └── route.ts       # Better Auth catch-all handler
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx   # Session context provider
│   │   ├── SignInForm.tsx     # Sign-in form with React Hook Form
│   │   └── SignUpForm.tsx     # Sign-up form with React Hook Form
│   ├── layout/
│   │   ├── Header.tsx         # App header with user name + sign-out
│   │   └── Container.tsx      # Layout container
│   ├── todo/                  # TodoForm, TodoList, TodoItem, etc.
│   └── ui/                    # Button, Card, Input, Dialog, etc.
├── db/
│   ├── index.ts               # Drizzle + Neon database connection
│   └── schema.ts              # Auth table definitions (user, session, account, jwks)
├── drizzle/                   # Generated migration SQL files
├── lib/
│   ├── auth.ts                # Better Auth server instance (JWT + Drizzle + nextCookies)
│   ├── auth-client.ts         # Better Auth client instance (jwtClient plugin)
│   ├── api.ts                 # Authenticated fetch utility (attaches Bearer token)
│   ├── hooks/
│   │   └── useTodos.ts        # Todo state management hook (uses auth session)
│   ├── services/
│   │   └── todoService.ts     # Backend API calls (authenticated, user-scoped)
│   ├── types/
│   │   └── todo.ts            # TypeScript interfaces (Task, TaskFilter)
│   └── utils/
│       └── todoHelpers.ts     # Utility functions
├── middleware.ts               # Route protection (redirects to /signin)
├── drizzle.config.ts          # Drizzle Kit configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies
├── .env.local                 # Environment variables (gitignored)
└── .env.example               # Environment variable template
```

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Secret for session encryption (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Yes | Frontend URL (`http://localhost:3000`) |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend API URL (`http://localhost:8000`) |

### 3. Run database migrations

```bash
# Creates auth tables (user, session, account, jwks) in Neon
npx drizzle-kit migrate
```

### 4. Start the development server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Authentication Flow

1. **Registration** (`/signup`): User submits name, email, password via `authClient.signUp.email()`
2. **Sign-in** (`/signin`): User authenticates via `authClient.signIn.email()`, session cookie is set
3. **Route protection**: `middleware.ts` checks for session cookie, redirects to `/signin` if missing
4. **Server-side check**: `page.tsx` calls `auth.api.getSession()` for additional server-side verification
5. **API calls**: `lib/api.ts` fetches JWT via `authClient.token()` and attaches `Authorization: Bearer <token>`
6. **Sign-out**: Header button calls `authClient.signOut()`, clears session, redirects to `/signin`

## API Endpoints Used

All task endpoints require authentication and use the pattern `/api/{userId}/tasks`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/{userId}/tasks` | Fetch user's tasks |
| `POST` | `/api/{userId}/tasks` | Create a new task |
| `PUT` | `/api/{userId}/tasks/{id}` | Update a task |
| `PATCH` | `/api/{userId}/tasks/{id}/complete` | Toggle completion |
| `DELETE` | `/api/{userId}/tasks/{id}` | Delete a task |

## Database Tables (managed by Better Auth via Drizzle)

| Table | Purpose |
|-------|---------|
| `user` | User accounts (id, name, email, etc.) |
| `session` | Active sessions |
| `account` | Auth provider accounts (stores hashed passwords) |
| `jwks` | JWT signing key pairs (EdDSA/Ed25519) |

## Troubleshooting

- **CORS errors**: Ensure the backend allows `http://localhost:3000` as an origin
- **401 on API calls**: Check that the frontend is running (backend needs JWKS endpoint)
- **Migration errors**: If tables already exist, use `npx drizzle-kit push` instead
- **Session issues**: Clear browser cookies and sign in again
