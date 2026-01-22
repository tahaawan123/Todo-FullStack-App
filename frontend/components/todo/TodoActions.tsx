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
      className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t"
      role="toolbar"
      aria-label="Task actions toolbar"
    >
      <div className="text-sm text-gray-600" tabIndex={0}>
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </div>

      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Task filters">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
          disabled={loading}
          aria-label={`Show all tasks (${activeCount + completedCount} total)`}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('active')}
          disabled={loading}
          aria-label={`Show active tasks (${activeCount} remaining)`}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('completed')}
          disabled={loading}
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
        aria-label={`Clear ${completedCount} completed tasks`}
      >
        Clear Completed ({completedCount})
      </Button>
    </div>
  );
};

export default TodoActions;