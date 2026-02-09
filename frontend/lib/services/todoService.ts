import { fetchWithAuth } from "../api";

interface TodoCreateData {
  title: string;
  description?: string | null;
}

interface TodoUpdateData {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

interface TodoResponse {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const getAllTodos = async (
  userId: string,
  timeoutMs: number = 10000
): Promise<TodoResponse[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetchWithAuth(`/api/${userId}/tasks`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch todos: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to the server. Please ensure the backend is running.");
    }
    throw error;
  }
};

export const createTodo = async (
  userId: string,
  todoData: TodoCreateData,
  timeoutMs: number = 10000
): Promise<TodoResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetchWithAuth(`/api/${userId}/tasks`, {
      method: "POST",
      body: JSON.stringify(todoData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid data provided");
      }
      throw new Error(`Failed to create todo: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to the server. Please ensure the backend is running.");
    }
    throw error;
  }
};

export const updateTodo = async (
  userId: string,
  id: number,
  todoData: TodoUpdateData,
  timeoutMs: number = 10000
): Promise<TodoResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetchWithAuth(`/api/${userId}/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(todoData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Task not found");
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid data provided");
      }
      throw new Error(`Failed to update todo: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to the server. Please ensure the backend is running.");
    }
    throw error;
  }
};

export const deleteTodo = async (
  userId: string,
  id: number,
  timeoutMs: number = 10000
): Promise<void> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetchWithAuth(`/api/${userId}/tasks/${id}`, {
      method: "DELETE",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Task not found");
      }
      throw new Error(`Failed to delete todo: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to the server. Please ensure the backend is running.");
    }
    throw error;
  }
};

export const toggleTodoCompletion = async (
  userId: string,
  id: number,
  completed: boolean,
  timeoutMs: number = 10000
): Promise<TodoResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetchWithAuth(`/api/${userId}/tasks/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Task not found");
      }
      throw new Error(`Failed to toggle todo completion: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to the server. Please ensure the backend is running.");
    }
    throw error;
  }
};
