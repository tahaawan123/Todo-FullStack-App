'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Task } from '@/lib/types/todo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface TodoFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  initialValue?: string;
  isEditing?: boolean;
  onCancel?: () => void;
  submitLoading?: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  initialValue = '',
  isEditing = false,
  onCancel,
  submitLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<{ title: string; description?: string }>();

  React.useEffect(() => {
    if (initialValue) {
      setValue('title', initialValue);
    }
  }, [initialValue, setValue]);

  const onFormSubmit = (data: { title: string; description?: string }) => {
    onSubmit(data);
    if (!isEditing) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="mb-6" role="form" aria-label={isEditing ? "Edit task form" : "Add new task form"}>
      <div className="grid grid-cols-1 gap-5">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-foreground mb-2">
            {isEditing ? 'Edit Task Title' : 'Add New Task'}
          </label>
          <Input
            id="task-title"
            {...register('title', {
              required: 'Task title is required',
              minLength: { value: 1, message: 'Task title cannot be empty' },
              maxLength: { value: 200, message: 'Task title is too long' }
            })}
            placeholder="Enter task title..."
            className={errors.title ? 'border-destructive' : ''}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-foreground mb-2">
            Description (Optional)
          </label>
          <Input
            id="task-description"
            {...register('description', { maxLength: { value: 1000, message: 'Description is too long' } })}
            placeholder="Enter task description (optional)..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            type="submit"
            variant="primary"
            loading={submitLoading}
            className="w-full sm:w-auto flex-1 sm:flex-initial"
          >
            {isEditing ? 'Update Task' : 'Add Task'}
          </Button>

          {isEditing && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default TodoForm;