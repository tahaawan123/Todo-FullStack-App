from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


class Message(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversation.id", index=True)
    user_id: str = Field(index=True)
    role: str = Field()
    content: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)
