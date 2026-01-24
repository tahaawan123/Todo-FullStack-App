import React from 'react';
import { Task } from '@/lib/types/todo';
import TodoItem from './TodoItem';
import TodoActions from './TodoActions';
import EmptyState from './EmptyState';

interface TodoListProps {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
  onToggle: (id: number) => void;
  onEdit: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
  clearCompleted: () => void;
  activeCount: number;
  completedCount: number;
  loading?: boolean;
  toggleLoading?: Record<string, boolean>;
  deleteLoading?: Record<string, boolean>;
}

const TodoList: React.FC<TodoListProps> = ({
  tasks,
  filter,
  onFilterChange,
  onToggle,
  onEdit,
  onDelete,
  clearCompleted,
  activeCount,
  completedCount,
  loading = false,
  toggleLoading = {},
  deleteLoading = {}
}) => {
  // Show loading skeletons when loading and no tasks exist yet
  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border border-border bg-card shadow-sm animate-pulse">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="mt-1 h-5 w-5 rounded bg-muted"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
              <div className="h-8 w-16 bg-muted rounded-md"></div>
              <div className="h-8 w-16 bg-muted rounded-md"></div>
              <div className="h-8 w-16 bg-muted rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <ul className="space-y-3" role="list" aria-label="List of tasks">
        {tasks.map((task) => (
          <TodoItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            toggleLoading={toggleLoading}
            deleteLoading={deleteLoading}
          />
        ))}
        {/* Show skeleton loaders for additional items being loaded */}
        {loading && tasks.length > 0 && (
          <>
            {[...Array(2)].map((_, index) => (
              <li key={`skeleton-${index}`} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border border-border bg-card shadow-sm animate-pulse">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="mt-1 h-5 w-5 rounded bg-muted"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                  <div className="h-8 w-16 bg-muted rounded-md"></div>
                  <div className="h-8 w-16 bg-muted rounded-md"></div>
                  <div className="h-8 w-16 bg-muted rounded-md"></div>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>

      <TodoActions
        filter={filter}
        onFilterChange={onFilterChange}
        clearCompleted={clearCompleted}
        activeCount={activeCount}
        completedCount={completedCount}
        loading={loading}
      />
    </div>
  );
};

export default TodoList;