'use client';

import React from 'react';
import { Task } from '@/lib/types/todo';
import Button from '@/components/ui/Button';

interface TodoItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isEditing?: boolean;
  editModeId?: string | null;
  toggleLoading?: Record<string, boolean>;
  deleteLoading?: Record<string, boolean>;
}

const TodoItem: React.FC<TodoItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  isEditing,
  editModeId,
  toggleLoading = {},
  deleteLoading = {}
}) => {
  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  return (
    <li
      className={`flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border ${task.completed ? 'bg-green-50' : 'bg-white'} shadow-sm`}
      role="listitem"
    >
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          disabled={toggleLoading[task.id]}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2"
          aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />

        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
            tabIndex={0}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`mt-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}
              tabIndex={0}
            >
              {task.description}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500" tabIndex={0}>
            Created: {task.createdAt.toLocaleDateString()} at {task.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
        <Button
          variant={task.completed ? 'secondary' : 'outline'}
          size="sm"
          onClick={handleToggle}
          disabled={toggleLoading[task.id]}
          aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
        >
          {toggleLoading[task.id] ? '...' : task.completed ? 'Undo' : 'Done'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          disabled={isEditing}
          aria-label={`Edit task "${task.title}"`}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={deleteLoading[task.id]}
          aria-label={`Delete task "${task.title}"`}
        >
          {deleteLoading[task.id] ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </li>
  );
};

export default TodoItem;