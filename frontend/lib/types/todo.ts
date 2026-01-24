export interface Task {
  id: number; // Backend uses integer IDs
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: Date; // Converted from ISO string for frontend use
  updatedAt: Date; // Converted from ISO string for frontend use
}

export type TaskFilter = 'all' | 'active' | 'completed';

export interface TaskListState {
  tasks: Task[];
  filter: TaskFilter;
  loading: boolean;
  error: string | null;
}