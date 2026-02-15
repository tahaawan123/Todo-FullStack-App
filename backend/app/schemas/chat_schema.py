from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID


class ChatRequest(SQLModel):
    message: str = Field(min_length=1, max_length=10000)
    conversation_id: Optional[UUID] = Field(default=None)


class ChatResponse(SQLModel):
    conversation_id: UUID
    response: str
    tool_calls: List[str] = Field(default_factory=list)


class MessageRead(SQLModel):
    id: UUID
    role: str
    content: str
    created_at: datetime


class ChatHistoryResponse(SQLModel):
    conversation_id: Optional[UUID] = None
    messages: List[MessageRead] = Field(default_factory=list)
