# Quickstart Guide: Todo Web Application Frontend

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git for version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to http://localhost:3000 to see the application

### Environment Configuration
No special environment variables needed for the frontend-only implementation.

## Project Structure Overview

```
app/
├── layout.tsx          # Root layout component
├── page.tsx            # Main application page
├── globals.css         # Global styles
└── loading.tsx         # Loading state component

components/
├── todo/               # Task-specific components
│   ├── TodoList.tsx
│   ├── TodoItem.tsx
│   ├── TodoForm.tsx
│   ├── TodoActions.tsx
│   └── EmptyState.tsx
├── ui/                 # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
└── layout/             # Layout components
    ├── Header.tsx
    └── Container.tsx

lib/
├── types/
│   └── todo.ts         # TypeScript type definitions
├── hooks/
│   └── useTodos.ts     # Custom hook for todo logic
└── utils/
    └── todoHelpers.ts  # Utility functions
```

## Key Features Walkthrough

### 1. Task Management
- **Add Task**: Use the input field at the top to create new tasks
- **Edit Task**: Click the edit button on any task to modify its content
- **Complete Task**: Check/uncheck the checkbox to toggle completion status
- **Delete Task**: Click the delete button to remove a task

### 2. Filtering
- Use the filter controls to show all tasks, active tasks, or completed tasks only

### 3. Responsive Design
- The application adapts to different screen sizes automatically
- Mobile-first approach with desktop enhancements

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## Component Usage Examples

### TodoList Component
```tsx
<TodoList
  tasks={tasks}
  onToggle={handleToggle}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### TodoForm Component
```tsx
<TodoForm
  onSubmit={handleSubmit}
  initialValue={editingTask?.title}
  isEditing={!!editingTask}
/>
```

## Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
Tests are located alongside components in `__tests__` directories or as `.test.tsx` files.

## Troubleshooting

### Common Issues
1. **Port already in use**
   - Change port in package.json or kill the process using port 3000

2. **Dependency conflicts**
   - Delete node_modules and reinstall with `npm install`

3. **TypeScript errors**
   - Run `npm run type-check` to see all type errors

### Getting Help
- Check the project documentation in `/specs/001-todo-frontend/`
- Review the feature specification at `/specs/001-todo-frontend/spec.md`
- Look at the implementation plan at `/specs/001-todo-frontend/plan.md`

## Next Steps

1. Explore the component architecture in `/components/`
2. Review the type definitions in `/lib/types/todo.ts`
3. Customize the styling in `/styles/globals.css`
4. Add new features following the established patterns