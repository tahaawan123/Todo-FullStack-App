#!/bin/bash

# Startup script for Todo App (Frontend + Backend)

echo "Starting Todo App - Frontend and Backend Integration..."

# Function to start backend
start_backend() {
    echo "Starting backend server..."
    cd backend
    source .venv/bin/activate 2>/dev/null || echo "Virtual environment not found, proceeding without activation"
    uvicorn app.main:app --reload &
    BACKEND_PID=$!
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
}

# Check if backend is running
if pgrep -f "uvicorn.*app.main" > /dev/null; then
    echo "Backend server is already running."
else
    start_backend
fi

# Check if frontend is running
if pgrep -f "npm.*dev" > /dev/null; then
    echo "Frontend server is already running."
else
    start_frontend
fi

echo "Both servers should be running:"
echo "- Backend: http://localhost:8000"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID