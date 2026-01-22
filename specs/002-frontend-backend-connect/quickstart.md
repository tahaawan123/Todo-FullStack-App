# Quickstart Guide: Frontend ↔ Backend Integration

## Prerequisites
- Node.js and npm/yarn for frontend
- Python and pip for backend
- Ensure backend is running before starting frontend

## Setup Instructions

### 1. Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Start backend server: `uvicorn main:app --reload`
4. Backend should be running on http://localhost:8000 (or configured port)

### 2. Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install` or `yarn install`
3. Create environment file: `cp .env.example .env.local`
4. Update `NEXT_PUBLIC_BACKEND_URL` in `.env.local` with backend URL
5. Start frontend: `npm run dev` or `yarn dev`
6. Frontend should be running on http://localhost:3000

### 3. Environment Configuration
- Backend URL format: `http://localhost:8000` (adjust port if needed)
- Frontend env var: `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`

## API Endpoints

### Todo Operations
- **GET** `/api/todos` - Retrieve all todos
- **POST** `/api/todos` - Create new todo
- **PUT** `/api/todos/{id}` - Update todo
- **DELETE** `/api/todos/{id}` - Delete todo

## Testing the Integration
1. Start both backend and frontend servers
2. Open browser to frontend URL (typically http://localhost:3000)
3. Verify no CORS errors in browser console
4. Test todo creation/deletion to verify backend communication
5. Check network tab for successful API requests

## Troubleshooting
- **CORS errors**: Verify backend CORS configuration allows frontend origin
- **Network errors**: Check backend URL in frontend environment variables
- **Port conflicts**: Adjust ports in configuration if needed