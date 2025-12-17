// App.tsx
console.log('=== App.tsx 模块开始加载 ===');

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Paperclip, Mic, ArrowUp, Settings2, RotateCcw, ThumbsUp, ThumbsDown, Share2, Copy, FileEdit, CirclePlus, ChevronDown, LogIn, Download, MessageSquare, ArrowRightCircle, History, Menu, X, AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import ProfessionalPanel from './components/ProfessionalPanel';
import { useChat, ChatMessage } from './hooks/useChat';
import { useChatHistory } from './hooks/useChatHistory';
import DownloadPanel from './components/DownloadPanel';
import { useDesignContext } from './hooks/useDesignContext';
import ThinkingBlock from './components/ThinkingBlock';
import { generateInputSuggestion } from './services/api';
import { generateInputSuggestionAsync } from './services/api';

console.log('App.tsx: 所有 import 完成');
// 定义当前激活的模块类型
type ActiveModule = 'input' | 'download' | 'qa';

const App: React.FC = () => {
  const [isProMode, setIsProMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);
  const [inputSuggestions, setInputSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deleteModalSession, setDeleteModalSession] = useState<{ id: string; title: string } | null>(null);
  const [personaKey, setPersonaKey] = useState<'pv' | 'pe' | 'emc'>('pv');
  const [personaOpen, setPersonaOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  // 当前激活的模块
  const [activeModule, setActiveModule] = useState<ActiveModule>('input');
  // 用于跟踪会话切换
  const isSessionSwitchRef = useRef(false);
  const prevSessionIdRef = useRef<string | null>(null);

  // 使用对话历史 hook
  const {
    currentSession,
    currentSessionId,
    createNewSession,
    switchSession,
    updateMessages,
    deleteSession,
    getGroupedSessions,
  } = useChatHistory();

  // 从 useChat 获取新增的方法
  const { 
    messages, 
    isLoading, 
    error, 
    designState, 
    chatMode,
    send, 
    clear, 
    retry, 
    setMessages, 
    resetDesignState,
    clearShowDownload,
    markDesignGenerated,
    switchToQAMode,
    switchToDesignMode,
  } = useChat();

  // ★★★ 将 useDesignContext 移到这里，在所有使用它的代码之前 ★★★
  const {
    extractedDesign,
    designParams,
    designResult,
    designSummary,
    isExtracting,
    hasValidDesign,
    extractFromMessages,
    clearDesign,
  } = useDesignContext();

  // 添加一个 useEffect 来监听消息变化并生成建议
  useEffect(() => {
    const generateSuggestions = async () => {
      if (messages.length > 0 && !isLoading) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant' && !lastMessage.isStreaming) {
          setIsSuggestionsLoading(true);  // 开始加载
          
          const apiMessages = messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          }));
          
          const suggestions = await generateInputSuggestionAsync(apiMessages);
          setInputSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
          setIsSuggestionsLoading(false);  // 加载完成
        }
      }
    };
    
    generateSuggestions();
  }, [messages, isLoading]);

  // 监听是否应该显示下载面板
  useEffect(() => {
    if (designState.shouldShowDownload) {
      (async () => {
        await extractFromMessages(messages);
        setShowDownloadPanel(true);
        setActiveModule('download');
        clearShowDownload();
      })();
    }
  }, [designState.shouldShowDownload, messages, extractFromMessages, clearShowDownload]);

  // 添加一个 useEffect 来监听消息变化并生成建议
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !lastMessage.isStreaming) {
        // 将 ChatMessage 转换为 Message 格式
        const apiMessages = messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));
        const suggestions = generateInputSuggestion(apiMessages);
        setInputSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      }
    }
  }, [messages, isLoading]);

  // 当用户开始输入时，如果内容为空则继续显示建议，否则隐藏
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      setShowSuggestions(false);
    } else if (inputSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [inputValue, inputSuggestions]);

  // 处理选择建议
  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // 开始新对话
  const handleNewChat = useCallback(() => {
    createNewSession();
    clear();
    clearDesign();
    resetDesignState();
    setDeleteModalSession(null);
    setShowDownloadPanel(false);
    setActiveModule('input');
    setInputSuggestions([]); // 清空建议
    setShowSuggestions(false);
  }, [createNewSession, clear, clearDesign, resetDesignState]);

  // 切换到历史对话
  const handleSwitchSession = useCallback((sessionId: string) => {
    switchSession(sessionId);
    setShowDownloadPanel(false);
    setIsMobileMenuOpen(false);
    resetDesignState();
    clearDesign();
    setDeleteModalSession(null);
    setActiveModule('input');
    setInputSuggestions([]); // 清空建议
    setShowSuggestions(false);
  }, [switchSession, resetDesignState, clearDesign]);

  // 处理下载面板确认后的操作
  const handleDownloadConfirmed = useCallback(() => {
    markDesignGenerated();
    setActiveModule('qa');
    switchToQAMode();
    setShowDownloadPanel(false);
    
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `您好！设计方案已生成完毕，现在进入问答阶段。

您可以随时向我提问，无论是关于：
1. 控制实现 - PWM策略、PI参数、MCU代码
2. 元器件替换 - 备选型号、性能影响对比
3. 设计原理 - 为什么选择这些元器件
4. 优化建议 - 如何进一步提升性能
5. 实际应用 - PCB布局、测试调试技巧

请问有什么我可以帮您的？`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, welcomeMessage]);
  }, [markDesignGenerated, switchToQAMode, setMessages]);

  // 设计确认横幅组件
  const DesignConfirmBanner = () => {
    if (!designState.isConfirmed && !designState.isAskingForGeneration) return null;
    
    return (
      <div className="bg-gradient-to-r from-[#E0E7FF] to-[#F0F5FF] rounded-xl p-4 mx-4 mb-4 shadow-sm border border-[#5B5FC7]/20">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#5B5FC7] flex items-center justify-center shrink-0">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-3 font-medium">
              {designState.isAskingForGeneration 
                ? '设计参数已确认，可以生成方案了！'
                : '太好了！设计参数已确认。现在您可以：'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  resetDesignState();
                  await extractFromMessages(messages);
                  setShowDownloadPanel(true);
                  setActiveModule('download');
                }}
                className="flex items-center px-4 py-2 bg-[#5B5FC7] text-white rounded-lg text-sm font-medium hover:bg-[#4a4ea3] transition-colors shadow-sm"
              >
                <Download size={16} className="mr-2" />
                生成并下载设计方案
              </button>
              <button
                onClick={() => {
                  resetDesignState();
                  send('我想继续调整一些参数');
                }}
                className="flex items-center px-4 py-2 border border-[#5B5FC7] text-[#5B5FC7] rounded-lg text-sm font-medium hover:bg-[#F0F5FF] transition-colors"
              >
                <MessageSquare size={16} className="mr-2" />
                继续优化参数
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // 侧边栏菜单按钮的渲染 - 改为进度指示器（不可点击）
  const renderMenuButtons = () => (
    <div className="space-y-2 mb-8">
      {/* 信息输入 - 始终可见，根据状态显示样式 */}
      <div 
        className={`w-full flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
          activeModule === 'input'
            ? 'bg-[#E0E7FF] text-[#5B5FC7] font-medium'
            : 'text-gray-400'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
          activeModule === 'input' 
            ? 'border-[#5B5FC7] bg-[#5B5FC7]' 
            : activeModule === 'download' || activeModule === 'qa'
              ? 'border-green-500 bg-green-500'
              : 'border-gray-300'
        }`}>
          {(activeModule === 'download' || activeModule === 'qa') && (
            <CheckCircle size={12} className="text-white" />
          )}
          {activeModule === 'input' && (
            <div className="w-2 h-2 bg-white rounded-full"></div>
          )}
        </div>
        信息输入
      </div>

      {/* 方案下载 - 根据进度显示 */}
      <div 
        className={`w-full flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
          activeModule === 'download'
            ? 'bg-[#E0E7FF] text-[#5B5FC7] font-medium'
            : activeModule === 'qa'
              ? 'text-gray-400'
              : 'text-gray-300'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
          activeModule === 'download'
            ? 'border-[#5B5FC7] bg-[#5B5FC7]'
            : activeModule === 'qa'
              ? 'border-green-500 bg-green-500'
              : 'border-gray-300'
        }`}>
          {activeModule === 'qa' && (
            <CheckCircle size={12} className="text-white" />
          )}
          {activeModule === 'download' && (
            <div className="w-2 h-2 bg-white rounded-full"></div>
          )}
        </div>
        方案下载
      </div>

      {/* 用户提问 - 最后阶段 */}
      <div 
        className={`w-full flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
          activeModule === 'qa'
            ? 'bg-[#E0E7FF] text-[#5B5FC7] font-medium'
            : 'text-gray-300'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
          activeModule === 'qa'
            ? 'border-[#5B5FC7] bg-[#5B5FC7]'
            : 'border-gray-300'
        }`}>
          {activeModule === 'qa' && (
            <div className="w-2 h-2 bg-white rounded-full"></div>
          )}
        </div>
        用户提问
      </div>

      {/* 分隔线 */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* 官网链接按钮 */}
      <a
        href="https://glittery-douhua-e39bdd.netlify.app/#"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[#F0F5FF] hover:text-[#5B5FC7] transition-colors group"
      >
        <div className="w-5 h-5 mr-3 flex items-center justify-center">
          <svg 
            className="w-4 h-4 text-gray-400 group-hover:text-[#5B5FC7] transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
            />
          </svg>
        </div>
        <span>访问官网</span>
        <svg 
          className="w-3.5 h-3.5 ml-auto text-gray-400 group-hover:text-[#5B5FC7] transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
          />
        </svg>
      </a>
    </div>
  );

  // 当切换会话时加载对应的消息
  useEffect(() => {
    if (currentSessionId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = currentSessionId;
      isSessionSwitchRef.current = true;
      
      if (currentSession) {
        setMessages(currentSession.messages);
      } else {
        setMessages([]);
      }
      
      setTimeout(() => {
        isSessionSwitchRef.current = false;
      }, 100);
    }
  }, [currentSessionId, currentSession, setMessages]);

  // 当消息变化时保存到历史
  useEffect(() => {
    if (!isSessionSwitchRef.current && currentSessionId && messages.length > 0) {
      updateMessages(messages);
    }
  }, [messages, currentSessionId, updateMessages]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  // 当点击"方案下载"时，触发参数提取
  const handleShowDownload = useCallback(async () => {
    setShowDownloadPanel(true);
    setIsMobileMenuOpen(false);
    
    if (messages.length > 0 && !hasValidDesign) {
      await extractFromMessages(messages);
    }
  }, [messages, hasValidDesign, extractFromMessages]);

  // 删除对话 - 弹窗确认
  const handleAskDeleteSession = useCallback((session: { id: string; title: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModalSession(session);
  }, []);

  const handleDeleteSession = useCallback(() => {
    if (deleteModalSession) {
      deleteSession(deleteModalSession.id);
      setDeleteModalSession(null);
    }
  }, [deleteModalSession, deleteSession]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalSession(null);
  }, []);

  // 触控长按删除 - 辅助方法
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleSessionPointerDown = useCallback((session: { id: string; title: string }, e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      clearLongPressTimer();
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        setDeleteModalSession(session);
      }, 600);
    }
  }, [clearLongPressTimer]);

  const handleSessionPointerUp = useCallback((sessionId: string, e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      clearLongPressTimer();
      if (longPressTriggeredRef.current) {
        longPressTriggeredRef.current = false;
        return; // 长按已触发删除，不再切换会话
      }
    }
    handleSwitchSession(sessionId);
  }, [clearLongPressTimer, handleSwitchSession]);

  const handleSessionPointerLeave = useCallback(() => {
    clearLongPressTimer();
    longPressTriggeredRef.current = false;
  }, [clearLongPressTimer]);

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    if (!currentSessionId) {
      createNewSession();
    }
    
    const message = inputValue;
    setInputValue('');
    setInputSuggestions([]); // 清空建议
    setShowSuggestions(false);
    await send(message);
  };

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 复制消息
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 获取分组的历史记录
  const { within7Days, within30Days, older } = getGroupedSessions();

  const personaOptions: Record<typeof personaKey, { label: string }> = {
    pv: {
      label: 'AI-光伏板设计专家'
    },
    pe: {
      label: 'AI-电力电子优化工程师'
    },
    emc: {
      label: 'AI-电磁与热可靠性顾问'
    }
  };

  // 渲染历史记录项
  const renderSessionItem = (session: { id: string; title: string }) => (
    <div
      key={session.id}
      className={`group flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-colors ${
        session.id === currentSessionId
          ? 'bg-[#E0E7FF] text-[#5B5FC7]'
          : 'hover:bg-gray-100 text-gray-600'
      }`}
      onClick={() => {
        if (longPressTriggeredRef.current) {
          longPressTriggeredRef.current = false;
          return;
        }
        handleSwitchSession(session.id);
      }}
      onPointerDown={(e) => handleSessionPointerDown(session, e)}
      onPointerUp={(e) => handleSessionPointerUp(session.id, e)}
      onPointerLeave={handleSessionPointerLeave}
    >
      <p className="truncate flex-1 text-sm">{session.title}</p>
      <button
        className="opacity-0 group-hover:opacity-100 flex items-center px-2 py-1 rounded-lg text-xs text-gray-500 hover:text-[#5B5FC7] hover:bg-[#EEF2FF] border border-transparent hover:border-[#E0E7FF] transition-all"
        onClick={(e) => handleAskDeleteSession(session, e)}
        title="删除对话"
      >
        <Trash2 size={14} className="mr-1" />
        <span className="hidden sm:inline">删除</span>
      </button>
    </div>
  );

  // 渲染单条消息
  const renderMessage = (msg: ChatMessage) => {
    if (msg.role === 'user') {
      return (
        <div key={msg.id} className="flex justify-end items-start space-x-2 md:space-x-3">
          <div className="bg-[#F9FAFB] border border-gray-100 rounded-2xl p-3 md:p-4 max-w-[85%] md:max-w-[80%] shadow-sm relative group">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {msg.content}
            </p>
            <div className="absolute -bottom-6 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy 
                size={14} 
                className="text-gray-400 cursor-pointer hover:text-gray-600" 
                onClick={() => copyToClipboard(msg.content)}
              />
              <FileEdit size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 overflow-hidden shrink-0 border border-white shadow-sm">
            <img src="https://picsum.photos/seed/user/32/32" alt="User" />
          </div>
        </div>
      );
    }

    // Assistant message
    return (
      <div key={msg.id} className="flex items-start space-x-2 md:space-x-3">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#5B5FC7] flex items-center justify-center shrink-0">
          <Bot className="text-white w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div className="bg-[#F0F5FF] rounded-2xl p-4 md:p-5 max-w-[85%] md:max-w-[85%] shadow-sm">
          <div className="font-medium text-sm text-gray-800 mb-2">[PEC-AI]</div>
          
          {/* 思考内容展示 */}
          {(msg.thinking || msg.isThinking) && (
            <ThinkingBlock 
              thinking={msg.thinking || ''}
              isThinking={msg.isThinking}
              duration={msg.thinkingDuration}
              defaultExpanded={false}
            />
          )}
          
          {/* 正式回复内容 */}
          <div className="text-sm text-gray-700 space-y-2 leading-relaxed whitespace-pre-wrap">
            {msg.content || (msg.isStreaming && !msg.content && (
              <span className="inline-flex items-center space-x-1 text-gray-500">
                <span>正在生成回复</span>
                <span className="inline-flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </span>
              </span>
            ))}
          </div>
          
          {/* Action Bar - 只在非流式状态下显示 */}
          {!msg.isStreaming && msg.content && (
            <div className="flex items-center space-x-3 md:space-x-4 mt-4 pt-2 flex-wrap">
              <Copy 
                size={16} 
                className="text-gray-400 cursor-pointer hover:text-gray-600" 
                onClick={() => copyToClipboard(msg.content)}
              />
              <RotateCcw 
                size={16} 
                className="text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={retry}
              />
              <ThumbsUp size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
              <ThumbsDown size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
              <span className="flex-1"></span>
              <Share2 size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-white font-sans overflow-hidden relative">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!isProMode ? (
        <div className={`
          fixed md:relative z-50 md:z-auto
          w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-4 h-full
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:shrink-0
        `}>
          <button 
            className="md:hidden absolute top-4 right-4 text-gray-500"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>

          <div className="flex items-center space-x-2 mb-8">
            <svg width="100" height="24" viewBox="0 0 100 30" fill="none">
              <text x="0" y="22" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#5B5FC7">PEC</text>
              <circle cx="58" cy="14" r="3" stroke="#5B5FC7" strokeWidth="1.5"/>
              <circle cx="65" cy="8" r="3" stroke="#5B5FC7" strokeWidth="1.5"/>
              <line x1="60" y1="12" x2="63" y2="10" stroke="#5B5FC7" strokeWidth="1.5"/>
              <text x="72" y="22" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#5B5FC7">AI</text>
            </svg>
          </div>

          <div className="relative mb-4">
            <button
              onClick={() => setPersonaOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-sm text-gray-700 hover:border-[#5B5FC7]/50 focus:border-[#5B5FC7] focus:ring-2 focus:ring-[#5B5FC7]/10 transition-all"
            >
              <span className="font-medium text-gray-800">{personaOptions[personaKey].label}</span>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${personaOpen ? 'rotate-180' : ''}`} />
            </button>
            {personaOpen && (
              <div className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-[#E5E9FF] shadow-lg overflow-hidden">
                {Object.entries(personaOptions).map(([key, opt]) => (
                  <button
                    key={key}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                      key === personaKey
                        ? 'bg-[#EEF2FF] text-[#2F54EB]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setPersonaKey(key as typeof personaKey);
                      setPersonaOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {key === personaKey && <CheckCircle size={14} className="text-[#2F54EB]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleNewChat}
            className="flex items-center justify-center w-full py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 mb-6 shadow-sm font-medium text-sm transition-colors"
          >
            <CirclePlus size={18} className="mr-2 text-gray-500" /> 开启新对话
          </button>

          {/* Menu Items - 进度指示器 */}
          {renderMenuButtons()}

          {/* History */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {within7Days.length > 0 && (
              <>
                <p className="text-xs text-gray-400 mb-3 font-medium">7天内</p>
                <div className="space-y-1 mb-6">
                  {within7Days.map(renderSessionItem)}
                </div>
              </>
            )}
            
            {within30Days.length > 0 && (
              <>
                <p className="text-xs text-gray-400 mb-3 font-medium">30天内</p>
                <div className="space-y-1 mb-6">
                  {within30Days.map(renderSessionItem)}
                </div>
              </>
            )}

            {older.length > 0 && (
              <>
                <p className="text-xs text-gray-400 mb-3 font-medium">更早</p>
                <div className="space-y-1">
                  {older.map(renderSessionItem)}
                </div>
              </>
            )}

            {within7Days.length === 0 && within30Days.length === 0 && older.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">暂无对话历史</p>
            )}
          </div>

          {/* User Footer */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-200 overflow-hidden mr-2 border-2 border-[#5B5FC7]">
                <img src="https://picsum.photos/32/32" alt="User" />
              </div>
              <span className="text-sm font-medium text-gray-700">用户123</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Settings2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        
        <div className="hidden md:flex w-16 bg-white border-r border-gray-200 flex-col items-center py-6 shrink-0 transition-all duration-300">
        {/* Mini Sidebar (Pro Mode) */}
          <div className="mb-8">
            <Bot className="w-8 h-8 text-[#5B5FC7]" />
          </div>

          <div className="flex flex-col space-y-6 flex-1 w-full items-center">
            <button className="text-gray-400 hover:text-[#5B5FC7] transition-colors" title="历史记录">
              <History size={20} />
            </button>
            <button 
              onClick={handleNewChat}
              className="text-gray-400 hover:text-[#5B5FC7] transition-colors" 
              title="新对话"
            >
              <CirclePlus size={20} />
            </button>
            
            {/* 进度指示器图标 - 不可点击 */}
            <div className={`p-2 rounded-lg transition-colors ${activeModule === 'input' ? 'text-[#5B5FC7] bg-[#EEF2FF]' : 'text-gray-300'}`} title="信息输入">
              <LogIn size={20} />
            </div>
            <div className={`p-2 rounded-lg transition-colors ${activeModule === 'download' ? 'text-[#5B5FC7] bg-[#EEF2FF]' : 'text-gray-300'}`} title="方案下载">
              <Download size={20} />
            </div>
            <div className={`p-2 rounded-lg transition-colors ${activeModule === 'qa' ? 'text-[#5B5FC7] bg-[#EEF2FF]' : 'text-gray-300'}`} title="用户提问">
              <MessageSquare size={20} />
            </div>
          </div>

          <div className="mt-auto pt-6 border-t w-8 flex justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-200 overflow-hidden border-2 border-[#5B5FC7] cursor-pointer">
              <img src="https://picsum.photos/32/32" alt="User" />
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full relative ${isProMode ? 'hidden md:flex' : 'flex'}`}>
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 relative">
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] md:max-w-none">
              {currentSession?.title || 'PEC-AI 对话'}
            </span>
          </div>

          <div className="hidden md:block"></div>

          {/* 专业模式按钮 */}
          {!isProMode && (
            <button
              onClick={() => setIsProMode(true)}
              className="flex items-center bg-[#E0E7FF] text-[#5B5FC7] px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-[#d0daff] transition-colors z-10"
            >
              <ArrowRightCircle size={16} className="mr-1 md:mr-1.5" />
              <span className="hidden sm:inline">专业模式</span>
              <span className="sm:hidden">专业</span>
            </button>
          )}
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 bg-white scrollbar-thin">
          
          {/* Welcome Message */}
          {messages.length === 0 && !showDownloadPanel && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Bot className="w-16 h-16 text-[#5B5FC7] mb-4" />
              <h2 className="text-xl font-medium text-gray-800 mb-2">欢迎使用 PEC-AI</h2>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                我是您的电力电子变换器设计助手，可以帮助您设计各种电源方案、计算参数、选择元器件。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  '导师让我做一个500W升压电路，从哪入手？',
                  '电池要求1kW，选什么拓扑？',
                  '老板要求48V转100V成本最低，选什么拓扑？',
                  '设计一个效率优先的Boost电路'
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(suggestion);
                      textareaRef.current?.focus();
                    }}
                    className="text-left p-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:border-[#5B5FC7]/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(renderMessage)}
          
          {/* Download Panel */}
          {showDownloadPanel && (
            <div className="flex items-start space-x-2 md:space-x-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#5B5FC7] flex items-center justify-center shrink-0">
                <Bot className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>
              <DownloadPanel 
                designParams={designParams}
                designResult={designResult}
                extractedDesign={extractedDesign}
                designSummary={designSummary}
                isExtracting={isExtracting}
                hasValidDesign={hasValidDesign}
                onClose={() => setShowDownloadPanel(false)} 
                onConfirm={handleDownloadConfirmed}
              />
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-start space-x-2 md:space-x-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#5B5FC7] flex items-center justify-center shrink-0">
                <Bot className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="bg-[#F0F5FF] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">正在思考</span>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
                <button onClick={retry} className="ml-2 underline hover:no-underline">重试</button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Design Confirm Banner */}
        <DesignConfirmBanner />

        {/* Input Area */}
        <div className="p-3 md:p-4 shrink-0">
          {/* 智能建议 - 只在没有显示下载面板和确认横幅时显示 */}
          {(showSuggestions || isSuggestionsLoading) && 
          !isLoading && 
          !showDownloadPanel &&  // 新增：下载面板显示时不显示建议
          !designState.isConfirmed &&  // 新增：参数确认时不显示建议
          !designState.isAskingForGeneration &&  // 新增：询问生成方案时不显示建议
          (
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 w-full mb-1">💡 猜你想说：</span>
              {isSuggestionsLoading ? (
                <span className="text-xs text-gray-400">正在思考...</span>
              ) : (
                inputSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-[#E0E7FF] text-gray-600 hover:text-[#5B5FC7] rounded-full border border-gray-200 hover:border-[#5B5FC7]/30 transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))
              )}
            </div>
          )}

          <div className="border border-[#5B5FC7]/30 rounded-2xl p-2 md:p-3 bg-white shadow-sm flex flex-col relative focus-within:ring-1 focus-within:ring-[#5B5FC7]/20 transition-all">
            <textarea 
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (inputValue.trim().length === 0 && inputSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="w-full resize-none outline-none text-sm text-gray-700 placeholder-gray-400 min-h-[40px] md:min-h-[50px] max-h-[150px] mb-2 bg-transparent" 
              placeholder="给PEC-AI发送消息（Enter 发送，Shift+Enter 换行）"
              disabled={isLoading}
            ></textarea>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="hidden sm:flex items-center text-[#5B5FC7] bg-[#E0E7FF] px-2 md:px-3 py-1 rounded-full text-xs font-medium hover:bg-[#d0daff] transition-colors">
                  <Settings2 size={12} className="mr-1" /> 深度思考
                </button>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-3">
                <Paperclip size={18} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Mic size={18} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className={`p-1.5 rounded-full transition-colors shadow-sm ${
                    isLoading || !inputValue.trim()
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#5B5FC7] hover:bg-[#4a4ea3] text-white'
                  }`}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="text-center text-[10px] text-gray-300 mt-2">内容由 AI 生成</div>
        </div>
      </div> 

      {/* 专业模式面板 */}
      {isProMode && (
        <div className="
          fixed md:relative inset-0 md:inset-auto
          w-full md:w-[55%] md:min-w-[500px] 
          h-full 
          bg-white md:bg-transparent
          border-l-0 md:border-l border-gray-200 
          shadow-none md:shadow-xl 
          z-50 md:z-10
          animate-in slide-in-from-right duration-300
        ">
          <ProfessionalPanel onClose={() => setIsProMode(false)} />
        </div>
      )}

      {/* 删除对话确认弹窗 */}
      {deleteModalSession && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E9FF] max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">要删除对话吗？</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              确定删除「{deleteModalSession.title || '未命名对话'}」？该操作无法恢复。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#5B5FC7] bg-white border border-[#DCE4FF] hover:bg-[#EEF2FF] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteSession}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#2F54EB] to-[#5B5FC7] hover:opacity-90 transition-opacity shadow-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
