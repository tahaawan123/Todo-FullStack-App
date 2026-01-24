'use client';

import { useState, useEffect } from 'react';
import { Task, TaskFilter, TaskListState } from '@/lib/types/todo';
import { getAllTodos, createTodo, updateTodo, deleteTodo, toggleTodoCompletion } from '../services/todoService';

export const useTodos = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load todos from backend on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const todos = await getAllTodos(10000);
      // Transform backend response to match frontend Task interface
      const transformedTodos = todos.map((todo: any) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        createdAt: new Date(todo.created_at), // Convert ISO string to Date object
        updatedAt: new Date(todo.updated_at) // Convert ISO string to Date object
      }));
      setTasks(transformedTodos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description?: string) => {
    // Optimistic update
    const tempId = Date.now(); // Use timestamp as temporary ID
    const optimisticTask: Task = {
      id: tempId,
      title,
      description: description || undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(prev => [optimisticTask, ...prev]);

    try {
      const newTodoData = {
        title,
        description: description || null
      };

      const newTodo = await createTodo(newTodoData, 10000);
      // Transform backend response to match frontend Task interface
      const newTask: Task = {
        id: newTodo.id,
        title: newTodo.title,
        description: newTodo.description,
        completed: newTodo.completed,
        createdAt: new Date(newTodo.created_at), // Convert ISO string to Date object
        updatedAt: new Date(newTodo.updated_at) // Convert ISO string to Date object
      };

      // Replace the optimistic task with the actual task
      setTasks(prev => prev.map(task =>
        task.id === tempId ? newTask : task
      ));
    } catch (err) {
      // Remove the optimistic task if the API call failed
      setTasks(prev => prev.filter(task => task.id !== tempId));
      setError(err instanceof Error ? err.message : 'Failed to create task');
      console.error(err);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    // Optimistic update - temporarily update the task
    const prevTasks = [...tasks];
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));

    try {
      const updateData = {
        title: updates.title,
        description: updates.description,
        completed: updates.completed
      };

      const updatedTodo = await updateTodo(id, updateData, 10000);
      // Transform backend response to match frontend Task interface
      const updatedTask: Task = {
        id: updatedTodo.id,
        title: updatedTodo.title,
        description: updatedTodo.description,
        completed: updatedTodo.completed,
        createdAt: new Date(updatedTodo.created_at), // Convert ISO string to Date object
        updatedAt: new Date(updatedTodo.updated_at) // Convert ISO string to Date object
      };

      setTasks(prev => prev.map(task =>
        task.id === id
          ? { ...updatedTask }
          : task
      ));
    } catch (err) {
      // Revert to previous state if the API call failed
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    // Optimistic update - remove the task immediately
    const taskToDelete = tasks.find(task => task.id === id);
    if (!taskToDelete) return; // Task doesn't exist

    const prevTasks = [...tasks];
    setTasks(prev => prev.filter(task => task.id !== id));

    try {
      await deleteTodo(id, 10000);
    } catch (err) {
      // Restore the task if the API call failed
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error(err);
    }
  };

  const toggleTaskCompletion = async (id: number) => {
    // Optimistic update - toggle the task completion status immediately
    const prevTasks = [...tasks];
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed, updatedAt: new Date() }
        : task
    ));

    try {
      // Get current task to get its current completion status
      const currentTask = tasks.find(task => task.id === id);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      const updatedTodo = await toggleTodoCompletion(id, !currentTask.completed, 10000);
      // Transform backend response to match frontend Task interface
      const updatedTask: Task = {
        id: updatedTodo.id,
        title: updatedTodo.title,
        description: updatedTodo.description,
        completed: updatedTodo.completed,
        createdAt: new Date(updatedTodo.created_at), // Convert ISO string to Date object
        updatedAt: new Date(updatedTodo.updated_at) // Convert ISO string to Date object
      };

      setTasks(prev => prev.map(task =>
        task.id === id
          ? { ...updatedTask }
          : task
      ));
    } catch (err) {
      // Revert to previous state if the API call failed
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : 'Failed to toggle task completion');
      console.error(err);
    }
  };

  // Clear all completed tasks
  const clearCompletedTasks = async () => {
    // Optimistic update - remove completed tasks immediately
    const completedTasks = tasks.filter(task => task.completed);
    if (completedTasks.length === 0) return; // No completed tasks to clear

    const prevTasks = [...tasks];
    setTasks(prev => prev.filter(task => !task.completed));

    try {
      // Delete all completed tasks
      const deletePromises = completedTasks.map(task => deleteTodo(task.id, 10000));
      await Promise.all(deletePromises);
    } catch (err) {
      // Restore the completed tasks if any API call failed
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : 'Failed to clear completed tasks');
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    // Apply filter
    if (filter === 'active') {
      if (!task.completed) {
        // Apply search query if exists
        if (searchQuery) {
          return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return true;
      }
      return false;
    }

    if (filter === 'completed') {
      if (task.completed) {
        // Apply search query if exists
        if (searchQuery) {
          return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return true;
      }
      return false;
    }

    // For 'all' filter, apply search query if exists
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  // For initial loading state, only show loading when tasks are empty
  const initialLoading = loading && tasks.length === 0;

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    loading: initialLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    clearCompletedTasks,
    loadTodos // Expose for manual reloading
  };
};