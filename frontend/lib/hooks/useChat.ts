import { useState, useEffect, useCallback } from 'react';
import { getHistory, sendMessage as sendChatMessage } from '../services/chatService';
import { useAuth } from '@/components/auth/AuthProvider';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHookReturn {
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  conversationId: string | null;
  setInputValue: (value: string) => void;
  sendMessage: () => Promise<void>;
  loadHistory: () => Promise<void>;
  resetChat: () => void;
  error: string | null;
}

export const useChat = (): ChatHookReturn => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const history = await getHistory(user.id);

      const historyMessages: ChatMessage[] = history.messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));

      setMessages(historyMessages);

      if (history.conversation_id) {
        setConversationId(history.conversation_id);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const sendMessageFunc = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(user.id, {
        message: messageText,
        conversation_id: conversationId || undefined,
      });

      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === 'RATE_LIMITED') {
        const rateLimitMsg: ChatMessage = {
          id: `rl-${Date.now()}`,
          role: 'assistant',
          content: "You're sending messages too quickly. Please wait a moment and try again.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, rateLimitMsg]);
      } else {
        setError(msg);
        console.error('Error sending message:', err);
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I encountered an error: ${msg}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    setInputValue('');
    setError(null);
  };

  // Load history on mount when user is available
  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  return {
    messages,
    inputValue,
    isLoading,
    conversationId,
    setInputValue,
    sendMessage: sendMessageFunc,
    loadHistory,
    resetChat,
    error,
  };
};
