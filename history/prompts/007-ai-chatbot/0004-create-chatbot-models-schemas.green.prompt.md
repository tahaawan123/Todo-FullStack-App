---
id: 0004
title: Create chatbot models and schemas
stage: green
date: 2026-02-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: 007-ai-chatbot
branch: 007-ai-chatbot
user: vc
command: none
labels: ["models", "schemas", "database", "chat"]
links:
  spec: specs/007-ai-chatbot/contracts/chat-api.yaml
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/models/conversation_model.py
  - backend/app/models/message_model.py
  - backend/app/schemas/chat_schema.py
tests:
  - none
---

## Prompt

Create three new files for the 007-ai-chatbot feature. Read the existing model patterns from backend/app/models/todo_model.py and backend/app/schemas/todo_schema.py first to match conventions.

**File 1: backend/app/models/conversation_model.py**
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**File 2: backend/app/models/message_model.py**
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    user_id: str = Field(index=True)
    role: str = Field()  # "user" or "assistant"
    content: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**File 3: backend/app/schemas/chat_schema.py**
Based on the OpenAPI contract at specs/007-ai-chatbot/contracts/chat-api.yaml:
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class ChatRequest(SQLModel):
    message: str = Field(min_length=1, max_length=10000)
    conversation_id: Optional[int] = Field(default=None)

class ChatResponse(SQLModel):
    conversation_id: int
    response: str
    tool_calls: list[str] = Field(default_factory=list)

class MessageRead(SQLModel):
    id: int
    role: str
    content: str
    created_at: datetime

class ChatHistoryResponse(SQLModel):
    conversation_id: Optional[int] = None
    messages: list[MessageRead] = Field(default_factory=list)
```

Write all three files. These are NEW files (they don't exist yet). Match the style of existing models (no docstrings, same Field patterns as todo_model.py).

## Response snapshot

Created three new files matching existing todo_model.py patterns:
- conversation_model.py: Conversation table with id, user_id, timestamps
- message_model.py: Message table with conversation_id FK, user_id, role, content, created_at
- chat_schema.py: ChatRequest, ChatResponse, MessageRead, ChatHistoryResponse schemas

All files follow conventions: no docstrings, SQLModel, Field patterns, datetime.utcnow for defaults, List instead of list for typing.

## Outcome

- ✅ Impact: Created database models and schemas for AI chatbot feature per OpenAPI contract
- 🧪 Tests: None (green stage - implementation only)
- 📁 Files: 3 new files created in backend/app/models/ and backend/app/schemas/
- 🔁 Next prompts: Create chat routes/endpoints, implement AI agent logic, add database migrations
- 🧠 Reflection: Successfully matched existing code style; ready for endpoint implementation

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): none
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Validate models work with SQLModel table creation
