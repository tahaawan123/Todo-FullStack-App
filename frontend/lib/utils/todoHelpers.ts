import { Task } from '@/lib/types/todo';

/**
 * Validates a task title
 * @param title The task title to validate
 * @returns True if valid, false otherwise
 */
export const isValidTaskTitle = (title: string): boolean => {
  return Boolean(title && title.trim().length >= 1 && title.trim().length <= 200);
};

/**
 * Validates a task description
 * @param description The task description to validate
 * @returns True if valid, false otherwise
 */
export const isValidTaskDescription = (description?: string): boolean => {
  if (!description) return true; // Description is optional
  return Boolean(description.length <= 1000);
};

/**
 * Generates a unique ID for a task
 * @returns A unique string ID
 */
export const generateTaskId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Formats a date for display
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Filters tasks based on the current filter
 * @param tasks The list of tasks to filter
 * @param filter The filter to apply
 * @returns Filtered list of tasks
 */
export const filterTasks = (tasks: Task[], filter: 'all' | 'active' | 'completed'): Task[] => {
  switch (filter) {
    case 'active':
      return tasks.filter(task => !task.completed);
    case 'completed':
      return tasks.filter(task => task.completed);
    default:
      return tasks;
  }
};

/**
 * Counts completed tasks
 * @param tasks The list of tasks to count
 * @returns Number of completed tasks
 */
export const countCompletedTasks = (tasks: Task[]): number => {
  return tasks.filter(task => task.completed).length;
};

/**
 * Counts active tasks
 * @param tasks The list of tasks to count
 * @returns Number of active tasks
 */
export const countActiveTasks = (tasks: Task[]): number => {
  return tasks.filter(task => !task.completed).length;
};