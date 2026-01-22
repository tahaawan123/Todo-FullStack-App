import React from 'react';
import { Task } from '@/lib/types/todo';
import TodoItem from './TodoItem';
import TodoActions from './TodoActions';
import EmptyState from './EmptyState';

interface TodoListProps {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  clearCompleted: () => void;
  activeCount: number;
  completedCount: number;
  loading?: boolean;
  toggleLoading?: Record<string, boolean>;
  deleteLoading?: Record<string, boolean>;
  isEditing?: boolean;
  editModeId?: string | null;
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
  deleteLoading = {},
  isEditing = false,
  editModeId = null
}) => {
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
            isEditing={isEditing}
            editModeId={editModeId}
            toggleLoading={toggleLoading}
            deleteLoading={deleteLoading}
          />
        ))}
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