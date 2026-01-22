'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types/todo';
import { useTodos } from '@/lib/hooks/useTodos';
import { countActiveTasks, countCompletedTasks } from '@/lib/utils/todoHelpers';
import TodoForm from '@/components/todo/TodoForm';
import TodoList from '@/components/todo/TodoList';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';

export default function Home() {
  const {
    tasks,
    allTasks,
    filter,
    setFilter,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    clearCompletedTasks
  } = useTodos();

  const [isEditing, setIsEditing] = useState(false);
  const [editModeId, setEditModeId] = useState<string | null>(null);
  const [editFormValues, setEditFormValues] = useState({ title: '', description: '' });
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});

  const activeCount = countActiveTasks(allTasks);
  const completedCount = countCompletedTasks(allTasks);

  const handleFormSubmit = async (data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>) => {
    if (isEditing && editModeId) {
      // Update existing task
      await updateTask(editModeId, { title: data.title, description: data.description });
      setIsEditing(false);
      setEditModeId(null);
      setEditFormValues({ title: '', description: '' });
    } else {
      // Create new task
      await createTask(data.title, data.description);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditFormValues({ title: task.title, description: task.description || '' });
    setIsEditing(true);
    setEditModeId(task.id);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditModeId(null);
    setEditFormValues({ title: '', description: '' });
  };

  const handleToggle = async (id: string) => {
    setToggleLoading(prev => ({ ...prev, [id]: true }));
    try {
      await toggleTaskCompletion(id);
    } finally {
      setToggleLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(prev => ({ ...prev, [id]: true }));
    try {
      await deleteTask(id);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleClearCompleted = () => {
    clearCompletedTasks();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Todo App" />
      <Container maxWidth="2xl" className="py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <TodoForm
            onSubmit={handleFormSubmit}
            initialValue={isEditing ? editFormValues.title : ''}
            isEditing={isEditing}
            onCancel={handleCancelEdit}
            submitLoading={loading}
          />

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <TodoList
            tasks={tasks}
            filter={filter}
            onFilterChange={setFilter}
            onToggle={handleToggle}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            clearCompleted={handleClearCompleted}
            activeCount={activeCount}
            completedCount={completedCount}
            loading={loading}
            toggleLoading={toggleLoading}
            deleteLoading={deleteLoading}
            isEditing={isEditing}
            editModeId={editModeId}
          />
        </div>
      </Container>
    </div>
  );
}
