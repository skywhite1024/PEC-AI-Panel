// hooks/useChat.ts
import { useState, useCallback } from 'react';
import { 
  sendMessageStream, 
  Message, 
  checkDesignConfirmation, 
  checkUserWantsGeneration,
  checkAskingForGeneration,
  ChatMode 
} from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  thinkingDuration?: number;
  timestamp: Date;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export interface DesignState {
  isConfirmed: boolean;
  isAskingForGeneration: boolean;
  shouldShowDownload: boolean;
  hasGeneratedDesign: boolean;  // 新增：是否已生成设计方案
  params: {
    inputVoltage?: string;
    inputVoltageMin?: string;
    inputVoltageMax?: string;
    outputVoltage?: string;
    outputPower?: string;
    topology?: string;
    priority?: string;
  };
}

// 从对话中提取设计参数
function extractDesignParams(messages: ChatMessage[]): DesignState['params'] {
  const allText = messages.map(m => m.content).join(' ');
  const params: DesignState['params'] = {};
  
  // 提取电压范围
  const rangeMatch = allText.match(/(\d+)\s*[Vv]?\s*[-~到至]\s*(\d+)\s*[Vv]/);
  if (rangeMatch) {
    params.inputVoltageMin = rangeMatch[1];
    params.inputVoltageMax = rangeMatch[2];
    params.inputVoltage = rangeMatch[1];
  }
  
  // 提取输出电压
  const outputMatch = allText.match(/输出[电压]*[：:是为]?\s*(\d+)\s*[Vv]/i);
  if (outputMatch) {
    params.outputVoltage = outputMatch[1];
  }
  
  // 提取功率
  const powerMatch = allText.match(/(\d+)\s*[Ww瓦]/);
  if (powerMatch) {
    params.outputPower = powerMatch[1];
  }
  
  // 识别拓扑
  if (allText.includes('升压') || allText.toLowerCase().includes('boost')) {
    params.topology = 'boost';
  } else if (allText.includes('降压') || allText.toLowerCase().includes('buck')) {
    params.topology = 'buck';
  }
  
  // 识别优先级
  if (allText.includes('效率优先') || allText.includes('高效')) {
    params.priority = 'efficiency';
  } else if (allText.includes('成本优先') || allText.includes('便宜')) {
    params.priority = 'cost';
  } else if (allText.includes('体积优先') || allText.includes('紧凑')) {
    params.priority = 'volume';
  } else if (allText.includes('均衡')) {
    params.priority = 'balanced';
  }
  
  return params;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [designState, setDesignState] = useState<DesignState>({
    isConfirmed: false,
    isAskingForGeneration: false,
    shouldShowDownload: false,
    hasGeneratedDesign: false,
    params: {}
  });
  const [currentThinking, setCurrentThinking] = useState<string>('');
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>('design');

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 流式发送消息
  const send = useCallback(async (content: string, designContext?: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setCurrentThinking('');
    
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    const assistantMessageId = generateId();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      thinking: '',
      timestamp: new Date(),
      isStreaming: true,
      isThinking: true,
    };
    
    const newMessages = [...messages, userMessage, assistantMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setThinkingStartTime(Date.now());

    // 检查用户是否要求生成方案（在 AI 询问之后）
    const userWantsGeneration = designState.isAskingForGeneration && checkUserWantsGeneration(content);
    
    if (userWantsGeneration) {
      setDesignState(prev => ({
        ...prev,
        shouldShowDownload: true,
        isAskingForGeneration: false
      }));
    }

    const history: Message[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: 'user', content: content.trim() });

    let finalContent = '';

    try {
      await sendMessageStream(history, {
        onThinking: (thinking) => {
          setCurrentThinking(thinking);
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, thinking, isThinking: true }
              : msg
          ));
        },
        onContent: (contentText) => {
          finalContent = contentText;
          const thinkingDuration = thinkingStartTime 
            ? Math.round((Date.now() - thinkingStartTime) / 1000)
            : undefined;
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: contentText, isStreaming: true, isThinking: false, thinkingDuration }
              : msg
          ));
        },
        onDone: () => {
          const thinkingDuration = thinkingStartTime 
            ? Math.round((Date.now() - thinkingStartTime) / 1000)
            : undefined;
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, isStreaming: false, isThinking: false, thinkingDuration }
              : msg
          ));
          setIsLoading(false);
          setThinkingStartTime(null);
          
          // 只在设计模式下检查确认状态
          if (chatMode === 'design') {
            // 检查 AI 回复是否在询问生成方案
            if (checkAskingForGeneration(finalContent)) {
              setDesignState(prev => ({
                ...prev,
                isAskingForGeneration: true,
                isConfirmed: true
              }));
            }
            // 检查用户是否确认了参数（但还没询问生成）
            else if (checkDesignConfirmation(content) && !designState.isAskingForGeneration) {
              const params = extractDesignParams([...messages, userMessage]);
              if (params.outputPower && (params.inputVoltage || params.inputVoltageMin)) {
                setDesignState(prev => ({
                  ...prev,
                  isConfirmed: true,
                  params
                }));
              }
            }
          }
        },
        onError: (err) => {
          setError(err.message);
          setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
          setIsLoading(false);
          setThinkingStartTime(null);
        }
      }, chatMode, designContext);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息失败');
      setIsLoading(false);
      setThinkingStartTime(null);
    }
  }, [messages, isLoading, thinkingStartTime, designState.isAskingForGeneration, chatMode]);

  // 清空对话
  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
    setDesignState({ 
      isConfirmed: false, 
      isAskingForGeneration: false,
      shouldShowDownload: false,
      hasGeneratedDesign: false,
      params: {} 
    });
    setCurrentThinking('');
    setChatMode('design');
  }, []);

  // 重试
  const retry = useCallback(async () => {
    if (messages.length < 2) return;
    
    const lastUserIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserIndex === -1) return;

    const lastUserMessage = messages[lastUserIndex];
    setMessages(prev => prev.slice(0, lastUserIndex));
    await send(lastUserMessage.content);
  }, [messages, send]);

  // 重置设计确认状态
  const resetDesignState = useCallback(() => {
    setDesignState({ 
      isConfirmed: false, 
      isAskingForGeneration: false,
      shouldShowDownload: false,
      hasGeneratedDesign: false,
      params: {} 
    });
  }, []);

  // 清除显示下载面板的标志
  const clearShowDownload = useCallback(() => {
    setDesignState(prev => ({
      ...prev,
      shouldShowDownload: false
    }));
  }, []);

  // 标记已生成设计方案
  const markDesignGenerated = useCallback(() => {
    setDesignState(prev => ({
      ...prev,
      hasGeneratedDesign: true,
      isConfirmed: false,
      isAskingForGeneration: false
    }));
  }, []);

  // 切换到问答模式
  const switchToQAMode = useCallback(() => {
    setChatMode('qa');
  }, []);

  // 切换到设计模式
  const switchToDesignMode = useCallback(() => {
    setChatMode('design');
  }, []);

  return {
    messages,
    isLoading,
    error,
    designState,
    currentThinking,
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
  };
}