'use client';

import { useState, useEffect } from 'react';
import { Task, TaskFilter } from '@/lib/types/todo';
import { useSession } from '@/lib/auth-client';
import { getAllTodos, createTodo, updateTodo, deleteTodo, toggleTodoCompletion } from '../services/todoService';

export const useTodos = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadTodos();
    }
  }, [userId]);

  const loadTodos = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const todos = await getAllTodos(userId, 10000);
      const transformedTodos = todos.map((todo: any) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        userId: todo.user_id,
        createdAt: new Date(todo.created_at),
        updatedAt: new Date(todo.updated_at),
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
    if (!userId) return;
    const tempId = Date.now();
    const optimisticTask: Task = {
      id: tempId,
      title,
      description: description || undefined,
      completed: false,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks(prev => [optimisticTask, ...prev]);

    try {
      const newTodo = await createTodo(userId, { title, description: description || null }, 10000);
      const newTask: Task = {
        id: newTodo.id,
        title: newTodo.title,
        description: newTodo.description,
        completed: newTodo.completed,
        userId: newTodo.user_id,
        createdAt: new Date(newTodo.created_at),
        updatedAt: new Date(newTodo.updated_at),
      };

      setTasks(prev => prev.map(task => (task.id === tempId ? newTask : task)));
    } catch (err) {
      setTasks(prev => prev.filter(task => task.id !== tempId));
      setError(err instanceof Error ? err.message : 'Failed to create task');
      console.error(err);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    if (!userId) return;
    const prevTasks = [...tasks];
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task))
    );

    try {
      const updateData = {
        title: updates.title,
        description: updates.description,
        completed: updates.completed,
      };

      const updatedTodo = await updateTodo(userId, id, updateData, 10000);
      const updatedTask: Task = {
        id: updatedTodo.id,
        title: updatedTodo.title,
        description: updatedTodo.description,
        completed: updatedTodo.completed,
        userId: updatedTodo.user_id,
        createdAt: new Date(updatedTodo.created_at),
        updatedAt: new Date(updatedTodo.updated_at),
      };

      setTasks(prev => prev.map(task => (task.id === id ? { ...updatedTask } : task)));
    } catch (err) {
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    if (!userId) return;
    const taskToDelete = tasks.find(task => task.id === id);
    if (!taskToDelete) return;

    const prevTasks = [...tasks];
    setTasks(prev => prev.filter(task => task.id !== id));

    try {
      await deleteTodo(userId, id, 10000);
    } catch (err) {
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error(err);
    }
  };

  const toggleTaskCompletion = async (id: number) => {
    if (!userId) return;
    const prevTasks = [...tasks];
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed, updatedAt: new Date() } : task
      )
    );

    try {
      const currentTask = tasks.find(task => task.id === id);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      const updatedTodo = await toggleTodoCompletion(userId, id, !currentTask.completed, 10000);
      const updatedTask: Task = {
        id: updatedTodo.id,
        title: updatedTodo.title,
        description: updatedTodo.description,
        completed: updatedTodo.completed,
        userId: updatedTodo.user_id,
        createdAt: new Date(updatedTodo.created_at),
        updatedAt: new Date(updatedTodo.updated_at),
      };

      setTasks(prev => prev.map(task => (task.id === id ? { ...updatedTask } : task)));
    } catch (err) {
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : 'Failed to toggle task completion');
      console.error(err);
    }
  };

  const clearCompletedTasks = async () => {
    if (!userId) return;
    const completedTasks = tasks.filter(task => task.completed);
    if (completedTasks.length === 0) return;

    const prevTasks = [...tasks];
    setTasks(prev => prev.filter(task => !task.completed));

    try {
      const deletePromises = completedTasks.map(task => deleteTodo(userId, task.id, 10000));
      await Promise.all(deletePromises);
    } catch (err) {
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : 'Failed to clear completed tasks');
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') {
      if (!task.completed) {
        if (searchQuery) {
          return (
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        return true;
      }
      return false;
    }

    if (filter === 'completed') {
      if (task.completed) {
        if (searchQuery) {
          return (
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        return true;
      }
      return false;
    }

    if (searchQuery) {
      return (
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

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
    loadTodos,
  };
};
