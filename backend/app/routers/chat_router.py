import time
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from sqlmodel import Session, select
from datetime import datetime
from uuid import UUID
from ..database.database import get_session
from ..models.conversation_model import Conversation
from ..models.message_model import Message
from ..schemas.chat_schema import ChatRequest, ChatResponse, ChatHistoryResponse, MessageRead
from ..auth.dependencies import get_current_user, TokenPayload
from ..agents.todo_agent import run_agent

router = APIRouter()

# --- In-memory rate limiter: max 10 requests per user per 60 seconds ---
RATE_LIMIT_MAX = 10
RATE_LIMIT_WINDOW = 60  # seconds
_user_request_log: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(user_id: str) -> None:
    now = time.monotonic()
    timestamps = _user_request_log[user_id]
    # Prune entries older than the window
    _user_request_log[user_id] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    if len(_user_request_log[user_id]) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests, please wait a moment before sending another message.",
        )
    _user_request_log[user_id].append(now)


def _verify_user_access(user_id: str, current_user: TokenPayload) -> None:
    if user_id != current_user.sub:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's resources",
        )


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def create_chat_message(
    user_id: str,
    chat_request: ChatRequest,
    session: Session = Depends(get_session),
    current_user: TokenPayload = Depends(get_current_user),
):
    """Send a chat message to the AI assistant."""
    _verify_user_access(user_id, current_user)
    _check_rate_limit(user_id)

    # Handle empty/whitespace messages
    if not chat_request.message.strip():
        conversation = _get_or_create_conversation(
            session, user_id, chat_request.conversation_id
        )
        return ChatResponse(
            conversation_id=conversation.id,
            response="Please type a message to get started!",
            tool_calls=[],
        )

    # Get or create conversation
    conversation = _get_or_create_conversation(
        session, user_id, chat_request.conversation_id
    )

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        user_id=user_id,
        role="user",
        content=chat_request.message,
        created_at=datetime.utcnow(),
    )
    session.add(user_message)
    session.commit()

    # Load last 20 messages as history for agent context (token optimization)
    history_messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(20)
    ).all()
    # Reverse to chronological order
    history_messages = list(reversed(history_messages))

    # Build input for the agent
    input_messages = [
        {"role": msg.role, "content": msg.content} for msg in history_messages
    ]

    # Run the AI agent
    try:
        response_text, tool_calls = await run_agent(
            user_id=user_id,
            input_messages=input_messages,
        )
    except Exception as e:
        error_str = str(e).lower()
        if any(
            kw in error_str
            for kw in ["gemini", "google", "api", "timeout", "rate limit", "service"]
        ):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is temporarily unavailable. Please try again later.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat message: {str(e)}",
        )

    # Save AI response
    ai_message = Message(
        conversation_id=conversation.id,
        user_id=user_id,
        role="assistant",
        content=response_text,
        created_at=datetime.utcnow(),
    )
    session.add(ai_message)

    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    session.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        response=response_text,
        tool_calls=tool_calls,
    )


@router.get("/{user_id}/chat/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: TokenPayload = Depends(get_current_user),
):
    """Retrieve the most recent conversation and its messages."""
    _verify_user_access(user_id, current_user)

    # Find the most recent conversation
    conversation = session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(1)
    ).first()

    if not conversation:
        return ChatHistoryResponse(messages=[])

    # Get all messages in this conversation
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
    ).all()

    messages_data = [
        MessageRead(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at,
        )
        for msg in messages
    ]

    return ChatHistoryResponse(
        conversation_id=conversation.id,
        messages=messages_data,
    )


def _get_or_create_conversation(
    session: Session,
    user_id: str,
    conversation_id: UUID | None,
) -> Conversation:
    """Fetch an existing conversation or create a new one."""
    if conversation_id:
        conversation = session.exec(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        ).first()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
        return conversation

    conversation = Conversation(
        user_id=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation
