import { fetchWithAuth } from "../api";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatRequest {
  message: string;
  conversation_id?: string;
}

interface ChatResponse {
  conversation_id: string;
  response: string;
  tool_calls: string[];
}

interface ChatHistoryResponse {
  conversation_id?: string;
  messages: ChatMessage[];
}

export const sendMessage = async (
  userId: string,
  chatRequest: ChatRequest,
): Promise<ChatResponse> => {
  try {
    const response = await fetchWithAuth(`/api/${userId}/chat`, {
      method: "POST",
      body: JSON.stringify(chatRequest),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid request data");
      }
      if (response.status === 403) {
        throw new Error("Not authorized to access this chat");
      }
      if (response.status === 429) {
        throw new Error("RATE_LIMITED");
      }
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to the server. Please ensure the backend is running.");
    }
    throw error;
  }
};

export const getHistory = async (
  userId: string,
): Promise<ChatHistoryResponse> => {
  try {
    const response = await fetchWithAuth(`/api/${userId}/chat/history`, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Not authorized to access this chat history");
      }
      throw new Error(`Failed to fetch chat history: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform the response to match the expected format
    return {
      conversation_id: data.conversation_id,
      messages: data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.created_at)
      }))
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to the server. Please ensure the backend is running.");
    }
    throw error;
  }
};
