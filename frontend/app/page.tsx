'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types/todo';
import { useTodos } from '@/lib/hooks/useTodos';
import { countActiveTasks, countCompletedTasks } from '@/lib/utils/todoHelpers';
import TodoForm from '@/components/todo/TodoForm';
import TodoList from '@/components/todo/TodoList';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import SearchInput from '@/components/ui/SearchInput';
import Toast from '@/components/ui/Toast';

export default function Home() {
  const {
    tasks,
    allTasks,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    clearCompletedTasks
  } = useTodos();

  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'warning' | 'info' });

  const activeCount = countActiveTasks(allTasks);
  const completedCount = countCompletedTasks(allTasks);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleFormSubmit = async (data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Create new task
      await createTask(data.title, data.description || undefined);
      showToast('Task created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create task', 'error');
    }
  };

  const handleEdit = async (id: number, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates);
      showToast('Task updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
  };

  const handleToggle = async (id: number) => {
    setToggleLoading(prev => ({ ...prev, [id]: true }));
    try {
      await toggleTaskCompletion(id);
      const task = allTasks.find(t => t.id === id);
      const action = task?.completed ? 'marked incomplete' : 'marked complete';
      showToast(`Task ${action} successfully!`, 'success');
    } catch (err) {
      showToast('Failed to update task', 'error');
    } finally {
      setToggleLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteLoading(prev => ({ ...prev, [id]: true }));
    try {
      await deleteTask(id);
      showToast('Task deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete task', 'error');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleClearCompleted = () => {
    try {
      clearCompletedTasks();
      showToast('Completed tasks cleared!', 'success');
    } catch (err) {
      showToast('Failed to clear completed tasks', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Todo App" />
      <Container maxWidth="2xl" className="py-8">
        <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8">
          <TodoForm
            onSubmit={handleFormSubmit}
            submitLoading={loading}
          />

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search todos..."
                />
              </div>
            </div>
          </div>

          <TodoList
            tasks={tasks}
            filter={filter}
            onFilterChange={setFilter}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            clearCompleted={handleClearCompleted}
            activeCount={activeCount}
            completedCount={completedCount}
            loading={loading}
            toggleLoading={toggleLoading}
            deleteLoading={deleteLoading}
          />
        </div>
      </Container>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
