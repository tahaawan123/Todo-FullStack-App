# API Contracts: Todo Web Application Frontend

## Overview
This document outlines the expected API contracts for the Todo Web Application Frontend. Since this is a frontend-only implementation, these represent the interface contracts that would be used when connecting to a backend service.

## API Endpoints

### Base URL
```
https://api.example.com/v1
```

### Authentication
All endpoints require authentication via JWT token in Authorization header:
```
Authorization: Bearer {jwt_token}
```

## Task Endpoints

### GET /users/{user_id}/tasks
Retrieve all tasks for a specific user

**Request:**
```
GET /users/{user_id}/tasks
Authorization: Bearer {jwt_token}
```

**Response (Success 200):**
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "completed": false,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "total": "number"
}
```

**Response (Error 401):**
```json
{
  "error": "Unauthorized"
}
```

### POST /users/{user_id}/tasks
Create a new task for a user

**Request:**
```
POST /users/{user_id}/tasks
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "string",
  "description": "string"
}
```

**Response (Success 201):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "completed": false,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Response (Error 400):**
```json
{
  "error": "Invalid input"
}
```

### PUT /users/{user_id}/tasks/{task_id}
Update an existing task

**Request:**
```
PUT /users/{user_id}/tasks/{task_id}
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "string",
  "description": "string"
}
```

**Response (Success 200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "completed": false,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### PATCH /users/{user_id}/tasks/{task_id}/complete
Toggle task completion status

**Request:**
```
PATCH /users/{user_id}/tasks/{task_id}/complete
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "completed": true
}
```

**Response (Success 200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "completed": true,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### DELETE /users/{user_id}/tasks/{task_id}
Delete a task

**Request:**
```
DELETE /users/{user_id}/tasks/{task_id}
Authorization: Bearer {jwt_token}
```

**Response (Success 204):**
```
No content
```

**Response (Error 404):**
```json
{
  "error": "Task not found"
}
```

## Error Responses

All error responses follow the same structure:
```json
{
  "error": "error_message",
  "code": "error_code"
}
```

Common error codes:
- `UNAUTHORIZED`: 401 - Invalid or missing authentication token
- `NOT_FOUND`: 404 - Resource does not exist
- `VALIDATION_ERROR`: 400 - Invalid request parameters or body
- `INTERNAL_ERROR`: 500 - Server error