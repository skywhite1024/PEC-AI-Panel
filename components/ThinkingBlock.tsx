// components/ThinkingBlock.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
  const thinkingLines = useMemo(
    () => thinking.split('\n').map(line => line.trim()).filter(Boolean),
    [thinking]
  );

  useEffect(() => {
    if (isThinking) {
      setIsExpanded(true);
    }
  }, [isThinking]);

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
          {isThinking ? '正在整理思路' : '思考摘要'}
        </span>

        {duration !== undefined && !isThinking && (
          <span className="text-gray-400 text-xs">
            约 {duration} 秒
          </span>
        )}

        {isExpanded ? (
          <ChevronDown size={14} className="text-gray-400" />
        ) : (
          <ChevronRight size={14} className="text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 ml-5 p-3 bg-gray-50 rounded-lg border border-gray-100 max-h-[240px] overflow-y-auto">
          <div className="space-y-2">
            {thinkingLines.length > 0 ? (
              thinkingLines.map((line, index) => (
                <div key={`${line}-${index}`} className="flex items-start space-x-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#5B5FC7]/70 shrink-0" />
                  <p className="text-xs text-gray-600 leading-6">{line}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-600 leading-6">
                {isThinking ? '正在整理设计条件并准备回复...' : '暂无思考摘要'}
              </p>
            )}
          </div>
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
