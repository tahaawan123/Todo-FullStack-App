# Data Model: Todo Web Application Frontend

## Overview
This document defines the data structures and state management approach for the Todo Web Application Frontend.

## Core Entities

### Task
The primary entity representing a user's task

**Fields:**
- `id`: string | Unique identifier for the task
- `title`: string | Title of the task (required)
- `description`: string | Detailed description of the task (optional)
- `completed`: boolean | Completion status of the task (default: false)
- `createdAt`: Date | Timestamp when the task was created
- `updatedAt`: Date | Timestamp when the task was last modified

**Validation Rules:**
- `title` must be non-empty (1-200 characters)
- `description` can be empty but limited to 1000 characters if provided
- `completed` must be a boolean value
- `createdAt` and `updatedAt` are automatically managed by the system

**State Transitions:**
- New task: `completed` = false
- Toggle completion: `completed` = !`completed`
- Edit task: Update `title`, `description`, and `updatedAt`
- Delete task: Remove from task list

### TaskList
Collection of tasks for a single user session

**Fields:**
- `tasks`: Array<Task> | List of tasks
- `filter`: string | Current filter state ('all', 'active', 'completed')
- `loading`: boolean | Whether data is being loaded
- `error`: string | Error message if any occurred

## Data Flow

### State Management
- Local state using React hooks (useState, useReducer)
- Context API if needed for deeper component trees
- No global state management required for this MVP

### Data Operations
- **Create**: Add new task to the beginning of the list
- **Read**: Display tasks based on current filter
- **Update**: Modify existing task properties
- **Delete**: Remove task from the list
- **Toggle**: Switch completion status

## UI State Models

### Form State
- `inputValue`: Current value in task creation/editing form
- `isEditing`: Boolean indicating if a task is currently being edited
- `editingTaskId`: ID of the task currently being edited

### Filter State
- `showActive`: Show only incomplete tasks
- `showCompleted`: Show only completed tasks
- `showAll`: Show all tasks (default)

## Type Definitions

### TypeScript Interfaces
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type TaskFilter = 'all' | 'active' | 'completed';

interface TaskListState {
  tasks: Task[];
  filter: TaskFilter;
  loading: boolean;
  error: string | null;
}
```

## Data Persistence (Mock)
- Since this is frontend-only implementation, data persistence will be simulated
- Local storage can be used for demo purposes but not required for MVP
- API integration points defined for future backend connection

## Validation Schema
- Input validation using React Hook Form schema
- Client-side validation before state updates
- Error handling and user feedback mechanisms