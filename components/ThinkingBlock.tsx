// components/ThinkingBlock.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, Loader2 } from 'lucide-react';

interface ThinkingBlockProps {
  thinking: string;
  isThinking?: boolean;
  duration?: number;
  defaultExpanded?: boolean;
}

const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  thinking,
  isThinking = false,
  duration,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!thinking && !isThinking) return null;

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
      >
        {isThinking ? (
          <Loader2 size={14} className="animate-spin text-[#5B5FC7]" />
        ) : (
          <Brain size={14} className="text-[#5B5FC7]" />
        )}
        
        <span className="font-medium">
          {isThinking ? '正在深度思考...' : `已深度思考`}
        </span>
        
        {duration !== undefined && !isThinking && (
          <span className="text-gray-400 text-xs">
            (用时 {duration} 秒)
          </span>
        )}
        
        {isExpanded ? (
          <ChevronDown size={14} className="text-gray-400" />
        ) : (
          <ChevronRight size={14} className="text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 ml-5 p-3 bg-gray-50 rounded-lg border border-gray-100 max-h-[300px] overflow-y-auto">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
            {thinking || (isThinking && '思考中...')}
          </pre>
          {isThinking && (
            <div className="flex items-center space-x-1 mt-2">
              <div className="w-1.5 h-1.5 bg-[#5B5FC7] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#5B5FC7] rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-[#5B5FC7] rounded-full animate-bounce delay-150"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThinkingBlock;