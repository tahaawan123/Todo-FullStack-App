# Full-Stack Todo Application

A modern full-stack Todo application built with Next.js (frontend) and FastAPI (backend) with PostgreSQL database. This application provides a complete solution for managing tasks with a responsive UI and robust backend API.

## Project Overview

This full-stack application consists of two main components that work together to provide a seamless user experience:

- **Frontend**: Next.js 16+ application with React 18+, TypeScript, and Tailwind CSS
- **Backend**: FastAPI application with SQLModel ORM and PostgreSQL database
- **Communication**: RESTful API with proper error handling and validation

The application supports all CRUD operations for todo items, including creating, reading, updating, deleting, and toggling completion status of tasks.

## Tech Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Runtime**: Node.js
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: PostgreSQL
- **ASGI Server**: Uvicorn

## Folder Structure

```
todo_fullstack_app/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── main.py         # Main application with CORS configuration
│   │   ├── models/         # Database models (SQLModel)
│   │   ├── schemas/        # Pydantic schemas for validation
│   │   ├── database/       # Database connection and session management
│   │   ├── routers/        # API route definitions
│   │   └── exceptions.py   # Custom exception handlers
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── README.md          # Backend documentation
├── frontend/                # Next.js frontend application
│   ├── app/               # Next.js app directory
│   ├── components/        # Reusable React components
│   ├── lib/               # Hooks, services, types, and utilities
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies
│   ├── .env.local         # Environment variables
│   └── README.md          # Frontend documentation
├── specs/                  # Feature specifications
├── history/                # Prompt history records and ADRs
├── .specify/               # SpecKit Plus templates and scripts
├── CLAUDE.md              # Claude Code rules
├── start-dev.sh           # Development startup script
└── README.md              # This file (Full-stack documentation)
```

## How Frontend and Backend Communicate

The frontend and backend communicate through a RESTful API:

1. **API Base URL**: The frontend uses `NEXT_PUBLIC_BACKEND_URL` environment variable to construct API endpoints
2. **Endpoints**: All API calls are prefixed with `/api` (e.g., `/api/todos`)
3. **CORS**: The backend is configured to accept requests from common frontend origins
4. **Data Format**: JSON is used for all data exchanges
5. **Error Handling**: Both sides implement proper error handling with user-friendly messages

### API Communication Flow
- Frontend makes HTTP requests to backend endpoints
- Backend validates input using Pydantic models
- Backend interacts with PostgreSQL database using SQLModel
- Responses are returned as JSON objects
- Frontend manages state and UI updates based on responses

## API Overview (CRUD Todos)

### Available Endpoints
- `POST /api/todos` - Create a new todo item
- `GET /api/todos` - Retrieve all todo items
- `GET /api/todos/{id}` - Retrieve a specific todo item
- `PUT /api/todos/{id}` - Update a specific todo item
- `PATCH /api/todos/{id}/complete` - Toggle completion status
- `DELETE /api/todos/{id}` - Delete a specific todo item
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint

### Data Model
Each todo item contains:
- `id`: Unique identifier (integer, auto-generated)
- `title`: Task title (string, required)
- `description`: Task description (string, optional)
- `completed`: Completion status (boolean, default: false)
- `created_at`: Creation timestamp (datetime, auto-generated)
- `updated_at`: Last update timestamp (datetime, auto-generated)

## Environment Variables

### Frontend
Create a `.env.local` file in the `frontend/` directory:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend
Create a `.env` file in the `backend/` directory:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
DEBUG=True
LOG_LEVEL=info
```

## How to Run Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Set up virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Linux/Mac
# or
.venv\Scripts\activate     # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables in `.env` file

5. Run the application:
```bash
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`.

## How to Run Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure environment variables in `.env.local` file

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:3000`.

## Common Issues & Troubleshooting

### API Connection Issues
- **Problem**: Frontend cannot connect to backend
- **Solution**: Verify `NEXT_PUBLIC_BACKEND_URL` matches your backend server address

### CORS Errors
- **Problem**: Cross-Origin Resource Sharing errors
- **Solution**: Check that your frontend origin is included in backend CORS configuration

### Database Connection
- **Problem**: Backend cannot connect to PostgreSQL
- **Solution**: Verify `DATABASE_URL` in backend `.env` file is correct

### Port Conflicts
- **Problem**: Ports 8000 (backend) or 3000 (frontend) are already in use
- **Solution**: Change ports in your run commands or kill conflicting processes

### Environment Variables
- **Problem**: Application fails due to missing configuration
- **Solution**: Ensure both frontend and backend `.env` files are properly configured

### Dependencies
- **Problem**: Missing packages or version conflicts
- **Solution**: Clean install dependencies in both frontend and backend directories

## Development Workflow

1. Start backend server first (on port 8000)
2. Configure frontend to point to backend URL
3. Start frontend server (on port 3000)
4. Access the application at http://localhost:3000

## Future Improvements

### Backend Enhancements
- Authentication and user management
- Pagination for large todo lists
- Search and filtering capabilities
- Rate limiting
- Advanced validation rules
- Background job processing

### Frontend Enhancements
- Dark/light mode toggle
- Drag-and-drop task reordering
- Keyboard shortcuts
- Offline support with service workers
- Progressive Web App (PWA) capabilities
- Advanced filtering and sorting options

### Infrastructure Improvements
- Docker containerization
- Automated testing pipeline
- Monitoring and logging
- Performance optimization
- Security hardening
- Deployment configurations for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - See LICENSE file for details.

## Support

For support, please check the documentation in the respective frontend and backend directories or open an issue in the repository.