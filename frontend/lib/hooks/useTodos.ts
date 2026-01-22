'use client';

import { useState, useEffect } from 'react';
import { Task, TaskFilter, TaskListState } from '@/lib/types/todo';
import { getAllTodos, createTodo, updateTodo, deleteTodo, toggleTodoCompletion } from '../services/todoService';

export const useTodos = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load todos from backend on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
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
      setError(null);
    } catch (err) {
      setError('Failed to load todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description?: string) => {
    setLoading(true);
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

      setTasks(prev => [newTask, ...prev]);
      setError(null);
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    setLoading(true);
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
      setError(null);
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    setLoading(true);
    try {
      await deleteTodo(id, 10000);
      setTasks(prev => prev.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (id: number) => {
    setLoading(true);
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
      setError(null);
    } catch (err) {
      setError('Failed to toggle task completion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Clear all completed tasks
  const clearCompletedTasks = async () => {
    setLoading(true);
    try {
      const completedTasks = tasks.filter(task => task.completed);

      // Delete all completed tasks
      const deletePromises = completedTasks.map(task => deleteTodo(task.id, 10000));
      await Promise.all(deletePromises);

      setTasks(prev => prev.filter(task => !task.completed));
      setError(null);
    } catch (err) {
      setError('Failed to clear completed tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    setFilter,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    clearCompletedTasks,
    loadTodos // Expose for manual reloading
  };
};