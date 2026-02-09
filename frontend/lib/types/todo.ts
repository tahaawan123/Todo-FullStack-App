export interface Task {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskFilter = 'all' | 'active' | 'completed';

export interface TaskListState {
  tasks: Task[];
  filter: TaskFilter;
  loading: boolean;
  error: string | null;
}
