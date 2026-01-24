/**
 * Service layer for handling API calls to the Todo backend
 */

// Define API base URL - this can be configured via environment variables
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api`;

// Define TypeScript interfaces to match backend models
interface TodoCreateData {
  title: string;
  description?: string | null;
}

interface TodoUpdateData {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

interface TodoToggleData {
  completed: boolean;
}

interface TodoResponse {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string; // snake_case from backend
  updated_at: string; // snake_case from backend
}

/**
 * Get all todos from the backend
 */
export const getAllTodos = async (timeoutMs: number = 10000): Promise<TodoResponse[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies and credentials for CORS
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return []; // Return empty array if no todos found
      }
      throw new Error(`Failed to fetch todos: ${response.status} ${response.statusText}`);
    }

    const todos = await response.json();
    return todos;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please ensure the backend is running.');
    }
    throw error;
  }
};

/**
 * Create a new todo
 */
export const createTodo = async (
  todoData: TodoCreateData,
  timeoutMs: number = 10000
): Promise<TodoResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
      credentials: 'include', // Include cookies and credentials for CORS
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid data provided');
      }
      throw new Error(`Failed to create todo: ${response.status} ${response.statusText}`);
    }

    const newTodo = await response.json();
    return newTodo;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please ensure the backend is running.');
    }
    throw error;
  }
};

/**
 * Update an existing todo
 */
export const updateTodo = async (
  id: number,
  todoData: TodoUpdateData,
  timeoutMs: number = 10000
): Promise<TodoResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
      credentials: 'include', // Include cookies and credentials for CORS
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Task not found');
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid data provided');
      }
      throw new Error(`Failed to update todo: ${response.status} ${response.statusText}`);
    }

    const updatedTodo = await response.json();
    return updatedTodo;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please ensure the backend is running.');
    }
    throw error;
  }
};

/**
 * Delete a todo by ID
 */
export const deleteTodo = async (id: number, timeoutMs: number = 10000): Promise<void> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies and credentials for CORS
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Task not found');
      }
      throw new Error(`Failed to delete todo: ${response.status} ${response.statusText}`);
    }

    // Successful deletion returns 200 with message, but we don't need the response body
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please ensure the backend is running.');
    }
    throw error;
  }
};

/**
 * Toggle the completion status of a todo
 */
export const toggleTodoCompletion = async (
  id: number,
  completed: boolean,
  timeoutMs: number = 10000
): Promise<TodoResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${API_BASE_URL}/todos/${id}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed }),
      credentials: 'include', // Include cookies and credentials for CORS
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Task not found');
      }
      throw new Error(`Failed to toggle todo completion: ${response.status} ${response.statusText}`);
    }

    const updatedTodo = await response.json();
    return updatedTodo;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please ensure the backend is running.');
    }
    throw error;
  }
};