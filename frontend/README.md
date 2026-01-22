# Todo App Frontend

A Next.js frontend for the Todo Web Application that integrates with the FastAPI backend.

## Tech Stack

- Next.js 16+
- React 18+
- TypeScript
- Tailwind CSS
- React Hook Form
- Node.js

## Installation & Setup

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
# or
bun install
```

3. Create a `.env.local` file in the frontend root directory with the backend URL:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Running the Application

1. Ensure the backend server is running (typically on http://localhost:8000)
2. Start the frontend development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The frontend will be available at `http://localhost:3000`.

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: Base URL of the backend API (default: http://localhost:8000)

## API Base URL Configuration

The application uses the `NEXT_PUBLIC_BACKEND_URL` environment variable to connect to the backend API. The service layer constructs API endpoints by appending routes to this base URL (e.g., `http://localhost:8000/api/todos`).

## Project Structure

```
frontend/
├── app/                   # Next.js app directory
│   ├── page.tsx          # Main page component with todo functionality
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── layout/           # Layout components (Header, Container)
│   └── todo/             # Todo-specific components (Form, List, Actions)
├── lib/                  # Library files
│   ├── hooks/            # React hooks (useTodos)
│   ├── services/         # API service implementations (todoService.ts)
│   ├── types/            # TypeScript type definitions (todo.ts)
│   └── utils/            # Utility functions (todoHelpers.ts)
├── public/               # Static assets
├── .env.local            # Environment variables
├── package.json          # Project dependencies
├── next.config.ts        # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## API Endpoints Used

- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/{id}` - Update a todo
- `PATCH /api/todos/{id}/complete` - Toggle completion status
- `DELETE /api/todos/{id}` - Delete a todo

## Key Features

- Full CRUD operations for todo items
- Real-time synchronization with backend API
- Loading states and error handling
- Responsive UI with Tailwind CSS
- Form validation and user feedback
- Task filtering (all/active/completed)
- Bulk operations (clear completed tasks)
- Edit-in-place functionality
- Loading indicators for individual actions

## Integration Details

- API calls are made through the centralized `todoService.ts`
- State management is handled by the `useTodos` hook
- All API requests include timeout handling (10 seconds default)
- Error handling displays user-friendly messages
- Type safety ensured through TypeScript interfaces
- Date conversion from ISO strings to Date objects for frontend use

## Common Issues & Troubleshooting

1. **API Connection Errors**: Ensure the backend server is running and the `NEXT_PUBLIC_BACKEND_URL` is correctly configured
2. **CORS Issues**: Verify that the backend CORS settings include your frontend origin
3. **Environment Variables**: Make sure `.env.local` is properly configured with the backend URL

## Development

- Use `npm run dev` for development mode with hot reloading
- The application follows Next.js 16+ App Router conventions
- Component-based architecture with reusable UI elements
- TypeScript provides compile-time type checking