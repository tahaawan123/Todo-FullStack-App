# API Contract: Task CRUD Endpoints (Authenticated)

**Feature**: 005-auth-system | **Service**: Backend (FastAPI) | **Base URL**: `http://localhost:8000`

> All task endpoints require a valid JWT bearer token in the `Authorization` header.
> The `{user_id}` in the URL must match the `sub` claim in the JWT.

---

## Common Headers

**Required on all protected endpoints**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Common Error Responses

### 401 Unauthorized (FR-011)
Missing, expired, or invalid token.
```json
{
  "detail": "Could not validate credentials"
}
```
```
WWW-Authenticate: Bearer
```

### 403 Forbidden (FR-010)
Token is valid but `user_id` in URL does not match JWT `sub` claim.
```json
{
  "detail": "Not authorized to access this user's resources"
}
```

---

## GET /api/{user_id}/tasks

**Purpose**: List all tasks for the authenticated user (FR-008, FR-009)

**Path Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | `string` | User UUID (must match JWT `sub`) |

**Response 200**:
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "user_id": "uuid-string",
    "created_at": "2026-02-08T12:00:00",
    "updated_at": "2026-02-08T12:00:00"
  }
]
```

**Query Logic**: `SELECT * FROM todo WHERE user_id = :jwt_sub`

---

## POST /api/{user_id}/tasks

**Purpose**: Create a new task for the authenticated user (FR-008, FR-009, FR-017)

**Path Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | `string` | User UUID (must match JWT `sub`) |

**Request Body**:
```json
{
  "title": "string (required, 1-255 chars)",
  "description": "string (optional, max 1000 chars)"
}
```

**Response 201**:
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "uuid-string",
  "created_at": "2026-02-08T12:00:00",
  "updated_at": "2026-02-08T12:00:00"
}
```

**Response 422** (validation error):
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "String should have at least 1 character",
      "type": "string_too_short"
    }
  ]
}
```

**Logic**: Sets `user_id` from JWT `sub` claim (not from request body).

---

## GET /api/{user_id}/tasks/{task_id}

**Purpose**: Get a specific task (FR-008, FR-009)

**Path Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | `string` | User UUID (must match JWT `sub`) |
| `task_id` | `integer` | Task ID |

**Response 200**:
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "uuid-string",
  "created_at": "2026-02-08T12:00:00",
  "updated_at": "2026-02-08T12:00:00"
}
```

**Response 404**:
```json
{
  "detail": "Todo not found"
}
```

**Query Logic**: `SELECT * FROM todo WHERE id = :task_id AND user_id = :jwt_sub`

---

## PUT /api/{user_id}/tasks/{task_id}

**Purpose**: Update a task (FR-008, FR-009)

**Path Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | `string` | User UUID (must match JWT `sub`) |
| `task_id` | `integer` | Task ID |

**Request Body**:
```json
{
  "title": "string (optional, 1-255 chars)",
  "description": "string (optional, max 1000 chars)",
  "completed": "boolean (optional)"
}
```

**Response 200**:
```json
{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "user_id": "uuid-string",
  "created_at": "2026-02-08T12:00:00",
  "updated_at": "2026-02-08T12:30:00"
}
```

**Response 404**:
```json
{
  "detail": "Todo not found"
}
```

**Query Logic**: `UPDATE todo SET ... WHERE id = :task_id AND user_id = :jwt_sub`

---

## PATCH /api/{user_id}/tasks/{task_id}/complete

**Purpose**: Toggle task completion status (FR-008, FR-009)

**Path Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | `string` | User UUID (must match JWT `sub`) |
| `task_id` | `integer` | Task ID |

**Request Body**:
```json
{
  "completed": "boolean (required)"
}
```

**Response 200**:
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "user_id": "uuid-string",
  "created_at": "2026-02-08T12:00:00",
  "updated_at": "2026-02-08T12:30:00"
}
```

**Response 404**:
```json
{
  "detail": "Todo not found"
}
```

---

## DELETE /api/{user_id}/tasks/{task_id}

**Purpose**: Delete a task (FR-008, FR-009)

**Path Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | `string` | User UUID (must match JWT `sub`) |
| `task_id` | `integer` | Task ID |

**Response 204**: No content.

**Response 404**:
```json
{
  "detail": "Todo not found"
}
```

**Query Logic**: `DELETE FROM todo WHERE id = :task_id AND user_id = :jwt_sub`

---

## GET /health

**Purpose**: Health check (FR-014) — **NO AUTHENTICATION REQUIRED**

**Response 200**:
```json
{
  "status": "healthy"
}
```

---

## GET /

**Purpose**: Root endpoint — **NO AUTHENTICATION REQUIRED**

**Response 200**:
```json
{
  "message": "Todo API is running"
}
```

---

## CORS Configuration (FR-015)

| Setting | Value |
|---------|-------|
| Allowed Origins | `http://localhost:3000`, `http://127.0.0.1:3000` |
| Allowed Methods | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` |
| Allowed Headers | `*` (including `Authorization`) |
| Allow Credentials | `true` |
| Max Age | `600` (10 minutes) |
