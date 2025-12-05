// App.tsx
console.log('=== App.tsx 模块开始加载 ===');

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Paperclip, Mic, ArrowUp, Settings2, RotateCcw, ThumbsUp, ThumbsDown, Share2, Copy, FileEdit, CirclePlus, ChevronDown, LogIn, Download, MessageSquare, ArrowRightCircle, History, Menu, X, AlertCircle, Trash2 } from 'lucide-react';
import ProfessionalPanel from './components/ProfessionalPanel';
import { useChat, ChatMessage } from './hooks/useChat';
import { useChatHistory } from './hooks/useChatHistory';
import DownloadPanel from './components/DownloadPanel';
import { useDesignContext } from './hooks/useDesignContext';
import ThinkingBlock from './components/ThinkingBlock';

console.log('App.tsx: 所有 import 完成');

const App: React.FC = () => {
  const [isProMode, setIsProMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // 使用聊天 hook - 只声明一次！
  const { 
    messages, 
    isLoading, 
    error, 
    designState, 
    send, 
    clear, 
    retry, 
    setMessages, 
    resetDesignState,
    clearShowDownload
  } = useChat();

  // 用于跟踪会话切换
  const isSessionSwitchRef = useRef(false);
  const prevSessionIdRef = useRef<string | null>(null);

  // 添加设计上下文
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

  // 监听是否应该显示下载面板
  useEffect(() => {
    if (designState.shouldShowDownload) {
      (async () => {
        await extractFromMessages(messages);
        setShowDownloadPanel(true);
        clearShowDownload();
      })();
    }
  }, [designState.shouldShowDownload, messages, extractFromMessages, clearShowDownload]);

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

  // 开始新对话
  const handleNewChat = useCallback(() => {
    createNewSession();
    clear();
    clearDesign();
    resetDesignState();
    setShowDownloadPanel(false);
  }, [createNewSession, clear, clearDesign, resetDesignState]);

  // 切换到历史对话
  const handleSwitchSession = useCallback((sessionId: string) => {
    switchSession(sessionId);
    setShowDownloadPanel(false);
    setIsMobileMenuOpen(false);
    resetDesignState();
    clearDesign();
  }, [switchSession, resetDesignState, clearDesign]);

  // 删除对话
  const handleDeleteSession = useCallback((sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个对话吗？')) {
      deleteSession(sessionId);
    }
  }, [deleteSession]);

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    if (!currentSessionId) {
      createNewSession();
    }
    
    const message = inputValue;
    setInputValue('');
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

  // 渲染历史记录项
  const renderSessionItem = (session: { id: string; title: string }) => (
    <div
      key={session.id}
      className={`group flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-colors ${
        session.id === currentSessionId
          ? 'bg-[#E0E7FF] text-[#5B5FC7]'
          : 'hover:bg-gray-100 text-gray-600'
      }`}
      onClick={() => handleSwitchSession(session.id)}
    >
      <p className="truncate flex-1 text-sm">{session.title}</p>
      <button
        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
        onClick={(e) => handleDeleteSession(session.id, e)}
        title="删除对话"
      >
        <Trash2 size={14} />
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

          <button className="flex items-center justify-between w-full px-4 py-2 border rounded-lg bg-white mb-4 text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
            <span>AI-光伏板设计专家</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          <button 
            onClick={handleNewChat}
            className="flex items-center justify-center w-full py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 mb-6 shadow-sm font-medium text-sm transition-colors"
          >
            <CirclePlus size={18} className="mr-2 text-gray-500" /> 开启新对话
          </button>

          {/* Menu Items */}
          <div className="space-y-2 mb-8">
            <button className="w-full flex items-center px-4 py-2 bg-[#E0E7FF] text-[#5B5FC7] rounded-lg text-sm font-medium transition-colors">
              <LogIn size={18} className="mr-3" /> 信息输入
            </button>
            <button 
              onClick={handleShowDownload}
              className={`w-full flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                showDownloadPanel 
                  ? 'bg-[#E0E7FF] text-[#5B5FC7] font-medium' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Download size={18} className="mr-3" /> 方案下载
            </button>
            <button className="w-full flex items-center px-4 py-2 text-gray-500 rounded-lg text-sm hover:bg-gray-100 transition-colors">
              <MessageSquare size={18} className="mr-3" /> 用户提问
            </button>
          </div>

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
        /* Mini Sidebar (Pro Mode) */
        <div className="hidden md:flex w-16 bg-white border-r border-gray-200 flex-col items-center py-6 shrink-0 transition-all duration-300">
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
            <button className="text-[#5B5FC7] bg-[#EEF2FF] p-2 rounded-lg transition-colors" title="信息输入">
              <LogIn size={20} />
            </button>
            <button 
              onClick={handleShowDownload}
              className="text-gray-400 hover:text-[#5B5FC7] transition-colors" 
              title="方案下载"
            >
              <Download size={20} />
            </button>
            <button className="text-gray-400 hover:text-[#5B5FC7] transition-colors" title="用户提问">
              <MessageSquare size={20} />
            </button>
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
                  '帮我设计一个500W的升压变换器',
                  '48V转100V的DC/DC该选什么拓扑？',
                  '如何计算MOSFET的导通损耗？',
                  '推荐一个10kW光伏逆变器方案'
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
          <div className="border border-[#5B5FC7]/30 rounded-2xl p-2 md:p-3 bg-white shadow-sm flex flex-col relative focus-within:ring-1 focus-within:ring-[#5B5FC7]/20 transition-all">
            <textarea 
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
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

      {/* Professional Mode Panel */}
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

    </div>
  );
};

export default App;