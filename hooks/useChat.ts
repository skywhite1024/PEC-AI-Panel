// hooks/useChat.ts
import { useState, useCallback } from 'react';
import { sendMessage, Message } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 普通发送（等待完整响应）
  const send = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    
    // 添加用户消息
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 构建历史消息
      const history: Message[] = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      history.push({ role: 'user', content: content.trim() });

      // 调用 API
      const response = await sendMessage(history);

      // 添加 AI 响应
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息失败');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  // 清空对话
  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // 重试最后一条消息
  const retry = useCallback(async () => {
    if (messages.length < 2) return;
    
    // 找到最后一条用户消息
    const lastUserIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserIndex === -1) return;

    const lastUserMessage = messages[lastUserIndex];
    
    // 移除最后一条 AI 回复
    setMessages(prev => prev.slice(0, -1));
    
    // 重新发送
    await send(lastUserMessage.content);
  }, [messages, send]);

  return {
    messages,
    isLoading,
    error,
    send,
    clear,
    retry,
    setMessages,
  };
}