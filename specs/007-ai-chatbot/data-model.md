# Data Model: Todo AI Chatbot Integration

**Feature**: 007-ai-chatbot | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Entity Overview

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│     User     │       │   Conversation   │       │   Message    │
│  (existing)  │──1:N──│     (new)        │──1:N──│   (new)      │
│              │       │                  │       │              │
│  id (str)    │       │  id (int, PK)    │       │  id (int, PK)│
│  email       │       │  user_id (str)   │       │  user_id     │
│  name        │       │  created_at      │       │  conv_id (FK)│
└──────────────┘       │  updated_at      │       │  role        │
        │              └──────────────────┘       │  content     │
        │                                         │  created_at  │
        │       ┌──────────────┐                  └──────────────┘
        └──1:N──│    Todo      │
                │  (existing)  │
                │              │
                │  id (int, PK)│
                │  user_id     │
                │  title       │
                │  description │
                │  completed   │
                │  created_at  │
                │  updated_at  │
                └──────────────┘
```

## Existing Entities (UNCHANGED)

### Todo (table: `todo`)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | int | PK, auto-increment | |
| user_id | str | indexed, NOT NULL | Links to Better Auth user.id |
| title | str | min=1, max=255, NOT NULL | |
| description | str | max=1000, nullable | |
| completed | bool | default=False | |
| created_at | datetime | default=utcnow | |
| updated_at | datetime | default=utcnow | |

**Location**: `backend/app/models/todo_model.py`
**Status**: No changes. MCP tools read/write this table through SQLModel.

### User (table: `user`)

Managed by Better Auth on the frontend (Drizzle ORM). Backend never writes to this table.
**Location**: `frontend/db/schema.ts`
**Status**: No changes.

## New Entities

### Conversation (table: `conversation`)

Represents a chat session between a user and the AI assistant. Each user has at most one active conversation (single-threaded per spec assumption).

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | int | PK, auto-increment | |
| user_id | str | indexed, NOT NULL | Links to Better Auth user.id |
| created_at | datetime | default=utcnow, NOT NULL | When conversation started |
| updated_at | datetime | default=utcnow, NOT NULL | Last message timestamp |

**SQLModel Definition**:
```python
class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Location**: `backend/app/models/conversation_model.py`

**Relationships**:
- `user_id` → references Better Auth `user.id` (logical FK, not enforced in DB since tables managed by different ORMs)
- One Conversation → many Messages

**Validation Rules**:
- `user_id` must not be empty
- Only the owning user can access their conversations

### Message (table: `message`)

Represents a single exchange within a conversation. Ordered by `created_at`.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | int | PK, auto-increment | |
| conversation_id | int | FK → conversation.id, NOT NULL | Parent conversation |
| user_id | str | indexed, NOT NULL | For user isolation queries |
| role | str | NOT NULL, one of: "user", "assistant" | Who sent the message |
| content | str | NOT NULL | Message text content |
| created_at | datetime | default=utcnow, NOT NULL | When message was sent |

**SQLModel Definition**:
```python
class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    user_id: str = Field(index=True)
    role: str = Field()  # "user" or "assistant"
    content: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Location**: `backend/app/models/message_model.py`

**Relationships**:
- `conversation_id` → enforced FK to `conversation.id`
- `user_id` → references Better Auth `user.id` (logical FK)

**Validation Rules**:
- `role` must be "user" or "assistant" (validated at application level)
- `content` must not be empty
- `user_id` must match the parent conversation's `user_id`

## Request/Response Schemas

### ChatRequest (Pydantic model, not a DB table)

```python
class ChatRequest(SQLModel):
    message: str = Field(min_length=1, max_length=10000)
    conversation_id: Optional[int] = Field(default=None)
```

### ChatResponse (Pydantic model, not a DB table)

```python
class ChatResponse(SQLModel):
    conversation_id: int
    response: str
    tool_calls: list[str] = Field(default_factory=list)
```

### MessageRead (Pydantic model for history)

```python
class MessageRead(SQLModel):
    id: int
    role: str
    content: str
    created_at: datetime
```

## State Transitions

### Conversation Lifecycle

```
[No conversation]
    → POST /chat (no conversation_id)
    → [Created] (new row in conversation table)
    → POST /chat (with conversation_id)
    → [Updated] (updated_at refreshed, new messages appended)
```

### Message Lifecycle

```
[User sends message]
    → Save user Message (role="user")
    → Agent processes
    → Save assistant Message (role="assistant")
```

Messages are append-only. No edits, no deletes.

## Database Migration Strategy

Tables are created automatically via the existing `SQLModel.metadata.create_all(bind=engine)` call in `main.py` on startup. No manual migration needed — SQLModel creates tables if they don't exist and leaves existing tables untouched.

## Indexes

| Table | Column(s) | Type | Purpose |
|---|---|---|---|
| conversation | user_id | B-tree | Fast lookup of user's conversations |
| message | conversation_id | B-tree | Fast lookup of messages in a conversation |
| message | user_id | B-tree | User isolation queries |

## Data Integrity

- `message.conversation_id` has a foreign key constraint to `conversation.id`
- `user_id` on both tables enables independent user isolation queries
- No cascade deletes defined (conversations and messages are retained)
- All timestamps use UTC
