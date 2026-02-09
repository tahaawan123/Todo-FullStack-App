'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types/todo';
import Button from '@/components/ui/Button';
import InlineEdit from '@/components/ui/InlineEdit';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface TodoItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
  toggleLoading?: Record<string, boolean>;
  deleteLoading?: Record<string, boolean>;
}

const TodoItem: React.FC<TodoItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  toggleLoading = {},
  deleteLoading = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = (title: string, description?: string) => {
    onEdit(task.id, { title, description });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    onDelete(task.id);
    setShowConfirmDialog(false);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg ${
          task.completed
            ? 'bg-muted/50 border-success-200 dark:border-success-800 opacity-75'
            : 'bg-card border-border'
        } shadow-sm transition-all duration-200`}
        role="listitem"
      >
        {/* Left accent bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3px] ${
            task.completed ? 'bg-success' : 'gradient-hero'
          }`}
        />

        <div className="flex items-start space-x-3 flex-1 min-w-0 pl-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            disabled={toggleLoading[task.id]}
            className="mt-1 h-5 w-5 rounded border-input text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2 cursor-pointer"
            aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <InlineEdit
                value={task.title}
                description={task.description || undefined}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                placeholder="Edit task title..."
              />
            ) : (
              <>
                <h3
                  className={`text-lg font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  tabIndex={0}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p
                    className={`mt-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}
                    tabIndex={0}
                  >
                    {task.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>Created:</span>
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded break-all">
                    {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <Button
              variant={task.completed ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleToggle}
              disabled={toggleLoading[task.id]}
              aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
            >
              {toggleLoading[task.id] ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ...
                </span>
              ) : task.completed ? 'Undo' : 'Done'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              aria-label={`Edit task "${task.title}"`}
            >
              Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteLoading[task.id]}
              className={`${deleteLoading[task.id] ? 'text-destructive hover:text-destructive/80' : 'text-destructive hover:text-destructive/80'}`}
              aria-label={`Delete task "${task.title}"`}
            >
              {deleteLoading[task.id] ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={closeConfirmDialog}
        onConfirm={confirmDelete}
        title="Delete Task"
        description={`Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default TodoItem;
