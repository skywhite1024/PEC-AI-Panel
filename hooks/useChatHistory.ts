// hooks/useChatHistory.ts
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from './useChat';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'pec-ai-chat-history';

// 从 localStorage 加载会话
function loadSessions(): ChatSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const sessions = JSON.parse(stored);
      // 转换日期字符串为 Date 对象
      return sessions.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));
    }
  } catch (error) {
    console.error('加载聊天历史失败:', error);
  }
  return [];
}

// 保存会话到 localStorage
function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('保存聊天历史失败:', error);
  }
}

// 生成唯一 ID
function generateId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 从消息内容生成标题（取前20个字符）
function generateTitle(content: string): string {
  const cleaned = content.trim().replace(/\n/g, ' ');
  return cleaned.length > 20 ? cleaned.substring(0, 20) + '...' : cleaned;
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 初始化加载历史
  useEffect(() => {
    const loadedSessions = loadSessions();
    setSessions(loadedSessions);
    
    // 如果有会话，加载最近的一个；否则创建新会话
    if (loadedSessions.length > 0) {
      // 按更新时间排序，取最新的
      const sorted = [...loadedSessions].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
      setCurrentSessionId(sorted[0].id);
    }
  }, []);

  // 当会话列表变化时保存
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  // 获取当前会话
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  // 创建新会话
  const createNewSession = useCallback((): string => {
    const newSession: ChatSession = {
      id: generateId(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, []);

  // 切换到指定会话
  const switchSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
    }
  }, [sessions]);

  // 更新当前会话的消息
  const updateMessages = useCallback((messages: ChatMessage[]) => {
    if (!currentSessionId) return;

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        // 如果是第一条用户消息，用它作为标题
        let title = session.title;
        if (session.title === '新对话' && messages.length > 0) {
          const firstUserMessage = messages.find(m => m.role === 'user');
          if (firstUserMessage) {
            title = generateTitle(firstUserMessage.content);
          }
        }
        
        return {
          ...session,
          title,
          messages,
          updatedAt: new Date(),
        };
      }
      return session;
    }));
  }, [currentSessionId]);

  // 删除会话
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      saveSessions(filtered);
      return filtered;
    });
    
    // 如果删除的是当前会话，切换到其他会话或创建新会话
    if (sessionId === currentSessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        setCurrentSessionId(null);
      }
    }
  }, [currentSessionId, sessions]);

  // 清空所有历史
  const clearAllHistory = useCallback(() => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // 获取按时间分组的会话列表
  const getGroupedSessions = useCallback(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const within7Days: ChatSession[] = [];
    const within30Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    // 按更新时间排序
    const sorted = [...sessions].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );

    sorted.forEach(session => {
      if (session.updatedAt >= sevenDaysAgo) {
        within7Days.push(session);
      } else if (session.updatedAt >= thirtyDaysAgo) {
        within30Days.push(session);
      } else {
        older.push(session);
      }
    });

    return { within7Days, within30Days, older };
  }, [sessions]);

  return {
    sessions,
    currentSession,
    currentSessionId,
    createNewSession,
    switchSession,
    updateMessages,
    deleteSession,
    clearAllHistory,
    getGroupedSessions,
  };
}