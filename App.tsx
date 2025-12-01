import React, { useState } from 'react';
import { Bot, Paperclip, Mic, ArrowUp, Settings2, RotateCcw, ThumbsUp, ThumbsDown, Share2, Copy, FileEdit, CirclePlus, ChevronDown, LogIn, Download, MessageSquare, ArrowRightCircle, History } from 'lucide-react';
import ProfessionalPanel from './components/ProfessionalPanel';

const App: React.FC = () => {
  const [isProMode, setIsProMode] = useState(false);

  return (
    <div className="flex h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* --- Sidebar (Navigation) --- */}
      {/* Logic: If Pro Mode, show Mini Sidebar. If Normal Mode, show Full Sidebar. */}
      
      {!isProMode ? (
        /* --- FULL SIDEBAR (Normal Mode) --- */
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-4 shrink-0 hidden md:flex transition-all duration-300">
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

          <button className="flex items-center justify-center w-full py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 mb-6 shadow-sm font-medium text-sm transition-colors">
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
        /* --- MINI SIDEBAR (Pro Mode) --- */
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 shrink-0 transition-all duration-300">
          <div className="mb-8">
             <Bot className="w-8 h-8 text-[#5B5FC7]" />
          </div>

          <div className="flex flex-col space-y-6 flex-1 w-full items-center">
             <button className="text-gray-400 hover:text-[#5B5FC7] transition-colors" title="历史记录">
               <History size={20} />
             </button>
             <button className="text-gray-400 hover:text-[#5B5FC7] transition-colors" title="新对话">
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
      <div className="flex-1 flex flex-col h-full relative">
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 relative">
           {/* Center Title - Absolute Positioning to keep it centered relative to container */}
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <span className="text-sm font-medium text-gray-700">5kW储能变换器设计</span>
           </div>

           {/* Empty div for flex spacing on left */}
           <div></div>

           {/* Right Side: Professional Mode Button (Only in Normal Mode) */}
           {!isProMode && (
             <button 
               onClick={() => setIsProMode(true)}
               className="flex items-center bg-[#E0E7FF] text-[#5B5FC7] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#d0daff] transition-colors z-10"
             >
               <ArrowRightCircle size={16} className="mr-1.5" />
               专业模式
             </button>
           )}
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white scrollbar-thin">
          
          {/* User Message */}
          <div className="flex justify-end items-start space-x-3">
             <div className="bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 max-w-[80%] shadow-sm relative group">
                <p className="text-sm text-gray-700 leading-relaxed">
                  你好，我们老板说要做一款新的电源产品，是个升压变换器，功率大概500w。主要是用在48V的电池系统里，升到100V给一个负载供电。这个项目还挺急的，你帮我看看怎么设计比较好。
                </p>
                <div className="absolute -bottom-6 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Copy size={14} className="text-gray-400 cursor-pointer" />
                   <FileEdit size={14} className="text-gray-400 cursor-pointer" />
                </div>
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden shrink-0 border border-white shadow-sm">
                <img src="https://picsum.photos/seed/user/32/32" alt="User" />
             </div>
          </div>

          {/* AI Thinking Status */}
          <div className="flex items-center space-x-2 pl-12 text-xs text-gray-400">
            <span>已深度思考（用时15秒）</span>
            <span className="cursor-pointer hover:text-gray-600">›</span>
          </div>

          {/* AI Response */}
          <div className="flex items-start space-x-3">
             <div className="w-8 h-8 rounded-lg bg-[#5B5FC7] flex items-center justify-center shrink-0">
               <Bot className="text-white w-5 h-5" />
             </div>
             <div className="bg-[#F0F5FF] rounded-2xl p-5 max-w-[85%] shadow-sm">
               <div className="font-medium text-sm text-gray-800 mb-2">[PEC-AI]</div>
               <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
                 <p>好的，收到！我们来设计这款用于48V电池系统的500W升压变换器。为了确保设计既可靠又高效，我们需要明确几个关键信息：</p>
                 <p>首先，关于输入电压，电池电压通常会有一个波动范围。您提到是‘48V的电池系统’，我猜您指的是标称电压。</p>
                 <p className="font-bold text-gray-900">您是希望我使用一个典型的48V锂电池电压范围（例如40V至55V）进行设计，还是您有更精确的范围要求？</p>
               </div>
               
               {/* Action Bar */}
               <div className="flex items-center space-x-4 mt-4 pt-2">
                 <Copy size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                 <RotateCcw size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                 <ThumbsUp size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                 <ThumbsDown size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                 <span className="flex-1"></span>
                 <Share2 size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
               </div>
             </div>
          </div>
          
           {/* User Message 2 */}
          <div className="flex justify-end items-start space-x-3">
             <div className="bg-[#F9FAFB] border border-gray-100 rounded-2xl p-4 max-w-[80%] shadow-sm relative group">
                <p className="text-sm text-gray-700 leading-relaxed">
                  你好，我们老板说要做一款新的电源产品，是个升压变换器，功率大概500w。
                </p>
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden shrink-0 border border-white shadow-sm">
                <img src="https://picsum.photos/seed/user/32/32" alt="User" />
             </div>
          </div>

          <div className="pl-12 flex space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce delay-75"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce delay-150"></div>
          </div>

        </div>

        {/* Input Area */}
        <div className="p-4 shrink-0">
          <div className="border border-[#5B5FC7]/30 rounded-2xl p-3 bg-white shadow-sm flex flex-col relative focus-within:ring-1 focus-within:ring-[#5B5FC7]/20 transition-all">
             <textarea 
               className="w-full resize-none outline-none text-sm text-gray-700 placeholder-gray-400 min-h-[50px] mb-2 bg-transparent" 
               placeholder="给PEC-AI发送消息"
             ></textarea>
             
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                   <button className="flex items-center text-[#5B5FC7] bg-[#E0E7FF] px-3 py-1 rounded-full text-xs font-medium hover:bg-[#d0daff] transition-colors">
                      <Settings2 size={12} className="mr-1" /> 深度思考
                   </button>
                </div>
                
                <div className="flex items-center space-x-3">
                   <Paperclip size={18} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                   <Mic size={18} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                   <button className="bg-[#5B5FC7] text-white p-1.5 rounded-full hover:bg-[#4a4ea3] transition-colors shadow-sm">
                      <ArrowUp size={18} />
                   </button>
                </div>
             </div>
          </div>
          <div className="text-center text-[10px] text-gray-300 mt-2">内容由 AI 生成</div>
        </div>
      </div>

      {/* --- Right Panel (Professional Mode) --- */}
      {/* Logic: Only show if Pro Mode is active. Approx 50% width as requested. */}
      {isProMode && (
        <div className="w-[50%] min-w-[400px] shrink-0 h-full border-l border-gray-200 shadow-xl z-10 hidden lg:block animate-in slide-in-from-right duration-300">
          <ProfessionalPanel onClose={() => setIsProMode(false)} />
        </div>
      )}

    </div>
  );
};

export default App;