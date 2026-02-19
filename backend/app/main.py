import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from .database.database import engine
from .logging_config import logger
from .routers import todo_router
from .routers.chat_router import router as chat_router
from .models.todo_model import Todo  # noqa: F401
from .models.conversation_model import Conversation  # noqa: F401
from .models.message_model import Message  # noqa: F401

app = FastAPI(
    title="Todo API",
    description="A simple Todo API built with FastAPI and SQLModel",
    version="1.0.0",
)

_default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
_extra = os.getenv("CORS_ALLOWED_ORIGINS", "")
_allowed_origins = _default_origins + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,
)

app.include_router(todo_router.router, prefix="/api", tags=["todos"])
app.include_router(chat_router, prefix="/api", tags=["chat"])  # Routes: /api/{user_id}/chat*


@app.on_event("startup")
async def on_startup():
    logger.info("Starting up Todo API application")
    SQLModel.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Shutting down Todo API application")


@app.get("/")
async def root():
    return {"message": "Todo API is running!"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
