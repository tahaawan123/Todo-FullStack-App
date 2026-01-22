from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import todo_router
from sqlmodel import SQLModel
from .database.database import engine
from .logging_config import logger

# Create FastAPI app instance
app = FastAPI(
    title="Todo API",
    description="A simple Todo API built with FastAPI and SQLModel",
    version="1.0.0",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Standard Next.js dev server
        "http://127.0.0.1:3000",   # Alternative localhost format
        "http://localhost:3001",   # Alternative Next.js dev server port
        "http://127.0.0.1:3001",   # Alternative localhost format
        "http://localhost:8000",   # Allow same-origin requests (if needed)
        "http://127.0.0.1:8000",   # Alternative format
        "https://localhost:3000",  # HTTPS versions (if using SSL in dev)
        "https://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    # Optionally expose headers that frontend might need to access
    expose_headers=["Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"]
)

# Include the todo router
from .routers import todo_router
app.include_router(todo_router.router, prefix="/api", tags=["todos"])

@app.on_event("startup")
async def on_startup():
    """
    Event handler for application startup.
    Creates database tables if they don't exist.
    """
    logger.info("Starting up Todo API application")
    SQLModel.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")

@app.on_event("shutdown")
async def on_shutdown():
    """
    Event handler for application shutdown.
    """
    logger.info("Shutting down Todo API application")

@app.get("/")
async def root():
    """
    Root endpoint to verify the API is running.
    """
    return {"message": "Todo API is running!"}

@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is operational.
    """
    return {"status": "healthy", "service": "todo-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)