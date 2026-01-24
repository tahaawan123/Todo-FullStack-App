import React from 'react';
import Button from '@/components/ui/Button';
interface TodoActionsProps {
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
  clearCompleted: () => void;
  activeCount: number;
  completedCount: number;
  loading?: boolean;
}

const TodoActions: React.FC<TodoActionsProps> = ({
  filter,
  onFilterChange,
  clearCompleted,
  activeCount,
  completedCount,
  loading = false
}) => {
  return (
    <div
      className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border"
      role="toolbar"
      aria-label="Task actions toolbar"
    >
      <div className="text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-full" tabIndex={0}>
        {activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining
      </div>

      <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Task filters">
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('all')}
          disabled={loading}
          className={`px-3 ${filter === 'all' ? 'font-semibold' : 'font-normal'}`}
          aria-label={`Show all tasks (${activeCount + completedCount} total)`}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('active')}
          disabled={loading}
          className={`px-3 ${filter === 'active' ? 'font-semibold' : 'font-normal'}`}
          aria-label={`Show active tasks (${activeCount} remaining)`}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('completed')}
          disabled={loading}
          className={`px-3 ${filter === 'completed' ? 'font-semibold' : 'font-normal'}`}
          aria-label={`Show completed tasks (${completedCount} completed)`}
        >
          Completed
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={clearCompleted}
        disabled={loading || completedCount === 0}
        className="text-destructive hover:text-destructive/80"
        aria-label={`Clear ${completedCount} completed tasks`}
      >
        Clear Completed
      </Button>
    </div>
  );
};

export default TodoActions;