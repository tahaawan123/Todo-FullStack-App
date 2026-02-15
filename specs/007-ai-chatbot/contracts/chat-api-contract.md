# API Contract: Todo AI Chatbot Integration

**Feature**: 007-ai-chatbot | **Date**: 2026-02-11 | **Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

## Endpoints

### POST /api/{user_id}/chat

**Description**: Create a new chat conversation or continue an existing one with the AI assistant.

**Path Parameters**:
- `user_id` (integer): The authenticated user's ID

**Request Body**:
```json
{
  "message": "string",
  "conversation_id": "string | null"
}
```

**Response**:
- **200 OK**:
```json
{
  "conversation_id": "string",
  "response": "string",
  "timestamp": "datetime"
}
```

**Headers**:
- Authorization: Bearer {jwt_token}

**Security**: JWT token must be valid and match the user_id in the path.

---

### GET /api/{user_id}/conversations

**Description**: Retrieve all conversations for the authenticated user.

**Path Parameters**:
- `user_id` (integer): The authenticated user's ID

**Query Parameters**:
- `limit` (integer, optional): Number of conversations to return (default: 20, max: 100)
- `offset` (integer, optional): Offset for pagination (default: 0)

**Response**:
- **200 OK**:
```json
{
  "conversations": [
    {
      "id": "string",
      "title": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "total": "integer"
}
```

**Headers**:
- Authorization: Bearer {jwt_token}

**Security**: JWT token must be valid and match the user_id in the path.

---

### GET /api/{user_id}/conversations/{conversation_id}

**Description**: Retrieve a specific conversation and its messages for the authenticated user.

**Path Parameters**:
- `user_id` (integer): The authenticated user's ID
- `conversation_id` (string): The conversation ID

**Response**:
- **200 OK**:
```json
{
  "conversation": {
    "id": "string",
    "title": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "messages": [
    {
      "id": "string",
      "role": "user|assistant",
      "content": "string",
      "timestamp": "datetime"
    }
  ]
}
```

**Headers**:
- Authorization: Bearer {jwt_token}

**Security**: JWT token must be valid and match the user_id in the path. User must own the conversation.

---

### DELETE /api/{user_id}/conversations/{conversation_id}

**Description**: Delete a specific conversation and all its messages for the authenticated user.

**Path Parameters**:
- `user_id` (integer): The authenticated user's ID
- `conversation_id` (string): The conversation ID

**Response**:
- **204 No Content**

**Headers**:
- Authorization: Bearer {jwt_token}

**Security**: JWT token must be valid and match the user_id in the path. User must own the conversation.

## Error Responses

All endpoints may return:
- **400 Bad Request**: Invalid request parameters or body
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User does not have access to the resource
- **404 Not Found**: Resource does not exist
- **500 Internal Server Error**: Unexpected server error

## Rate Limiting

All endpoints are subject to rate limiting:
- 100 requests per minute per user
- 10 chat requests per minute per user