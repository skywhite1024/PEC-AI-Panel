import React, { useState, useRef, useEffect } from 'react';
import { Bot, Paperclip, Mic, ArrowUp, Settings2, RotateCcw, ThumbsUp, ThumbsDown, Share2, Copy, FileEdit, CirclePlus, ChevronDown, LogIn, Download, MessageSquare, ArrowRightCircle, History, Menu, X, AlertCircle } from 'lucide-react';
import ProfessionalPanel from './components/ProfessionalPanel';
import { useChat, ChatMessage } from './hooks/useChat';

const App: React.FC = () => {
  const [isProMode, setIsProMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, error, send, clear, retry } = useChat();

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

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
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

    return (
      <div key={msg.id} className="flex items-start space-x-2 md:space-x-3">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#5B5FC7] flex items-center justify-center shrink-0">
          <Bot className="text-white w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div className="bg-[#F0F5FF] rounded-2xl p-4 md:p-5 max-w-[85%] md:max-w-[85%] shadow-sm">
          <div className="font-medium text-sm text-gray-800 mb-2">[PEC-AI]</div>
          <div className="text-sm text-gray-700 space-y-2 leading-relaxed whitespace-pre-wrap">
            {msg.content || (msg.isStreaming && (
              <span className="inline-flex space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              </span>
            ))}
          </div>
          
          {/* Action Bar */}
          {!msg.isStreaming && (
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
      
      {/* --- Mobile Menu Overlay --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- Sidebar (Navigation) --- */}
      {!isProMode ? (
        /* --- FULL SIDEBAR (Normal Mode) --- */
        <div className={`
          fixed md:relative z-50 md:z-auto
          w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-4 h-full
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:shrink-0
        `}>
          {/* Close button for mobile */}
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
            onClick={clear}
            className="flex items-center justify-center w-full py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 mb-6 shadow-sm font-medium text-sm transition-colors"
          >
            <CirclePlus size={18} className="mr-2 text-gray-500" /> 开启新对话
          </button>

          {/* Menu Items */}
          <div className="space-y-2 mb-8">
            <button className="w-full flex items-center px-4 py-2 bg-[#E0E7FF] text-[#5B5FC7] rounded-lg text-sm font-medium transition-colors">
              <LogIn size={18} className="mr-3" /> 信息输入
            </button>
            <button className="w-full flex items-center px-4 py-2 text-gray-500 rounded-lg text-sm hover:bg-gray-100 transition-colors">
              <Download size={18} className="mr-3" /> 方案下载
            </button>
            <button className="w-full flex items-center px-4 py-2 text-gray-500 rounded-lg text-sm hover:bg-gray-100 transition-colors">
              <MessageSquare size={18} className="mr-3" /> 用户提问
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <p className="text-xs text-gray-400 mb-3 font-medium">7天内</p>
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p className="truncate hover:text-[#5B5FC7] cursor-pointer transition-colors">10kW光伏并网逆变器设计</p>
              <p className="truncate hover:text-[#5B5FC7] cursor-pointer transition-colors">3kW氢燃料电池DC/DC变换器...</p>
              <p className="truncate hover:text-[#5B5FC7] cursor-pointer transition-colors">150kW电动汽车快速充电模块...</p>
              <p className="truncate hover:text-[#5B5FC7] cursor-pointer transition-colors">1kW微型燃气轮机发电系统控...</p>
            </div>
            
            <p className="text-xs text-gray-400 mb-3 font-medium">30天内</p>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="truncate hover:text-[#5B5FC7] cursor-pointer transition-colors">1MW工商业储能PCS（双向变...</p>
            </div>
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
        /* --- MINI SIDEBAR (Pro Mode) - Hidden on mobile --- */
        <div className="hidden md:flex w-16 bg-white border-r border-gray-200 flex-col items-center py-6 shrink-0 transition-all duration-300">
          <div className="mb-8">
            <Bot className="w-8 h-8 text-[#5B5FC7]" />
          </div>

          <div className="flex flex-col space-y-6 flex-1 w-full items-center">
            <button className="text-gray-400 hover:text-[#5B5FC7] transition-colors" title="历史记录">
              <History size={20} />
            </button>
            <button 
              onClick={clear}
              className="text-gray-400 hover:text-[#5B5FC7] transition-colors" 
              title="新对话"
            >
              <CirclePlus size={20} />
            </button>
            <button className="text-[#5B5FC7] bg-[#EEF2FF] p-2 rounded-lg transition-colors" title="信息输入">
              <LogIn size={20} />
            </button>
            <button className="text-gray-400 hover:text-[#5B5FC7] transition-colors" title="方案下载">
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

      {/* --- Main Chat Area --- */}
      <div className={`flex-1 flex flex-col h-full relative ${isProMode ? 'hidden md:flex' : 'flex'}`}>
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 relative">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Center Title */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] md:max-w-none">
              {messages.length > 0 ? 'PEC-AI 对话' : '5kW储能变换器设计'}
            </span>
          </div>

          {/* Empty div for flex spacing on left (desktop) */}
          <div className="hidden md:block"></div>

          {/* Right Side: Professional Mode Button */}
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
          
          {/* 欢迎消息（当没有消息时显示） */}
          {messages.length === 0 && (
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

          {/* 渲染消息列表 */}
          {messages.map(renderMessage)}

          {/* 加载指示器 */}
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

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
                <button 
                  onClick={retry}
                  className="ml-2 underline hover:no-underline"
                >
                  重试
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

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

      {/* --- Right Panel (Professional Mode) --- */}
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