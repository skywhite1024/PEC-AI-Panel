// hooks/useDesignContext.ts
import { useState, useCallback } from 'react';
import { 
  ExtractedDesign, 
  ChatMessageForExtract,
  extractDesignFromChat, 
  convertToDesignParams,
  generateDesignSummary 
} from '../services/designExtractor';
import { DesignParams, DesignResult, generateDesignResult } from '../services/reportGenerator';

console.log('=== useDesignContext.ts 开始加载 ===');

export function useDesignContext() {
  const [extractedDesign, setExtractedDesign] = useState<ExtractedDesign | null>(null);
  const [designParams, setDesignParams] = useState<DesignParams | null>(null);
  const [designResult, setDesignResult] = useState<DesignResult | null>(null);
  const [designSummary, setDesignSummary] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);

  // 从对话中提取设计参数
  const extractFromMessages = useCallback(async (messages: ChatMessageForExtract[]) => {
    if (messages.length === 0) {
      console.log('没有消息，跳过提取');
      return;
    }

    setIsExtracting(true);

    try {
      console.log('开始从对话中提取设计参数...');
      
      const extracted = await extractDesignFromChat(messages);
      console.log('提取结果:', extracted);
      
      setExtractedDesign(extracted);
      
      const params = convertToDesignParams(extracted);
      setDesignParams(params);
      
      const result = generateDesignResult(params);
      setDesignResult(result);
      
      const summary = generateDesignSummary(extracted, result);
      setDesignSummary(summary);
      
      console.log('设计方案生成完成');
    } catch (error) {
      console.error('提取设计参数失败:', error);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // 清空设计上下文
  const clearDesign = useCallback(() => {
    setExtractedDesign(null);
    setDesignParams(null);
    setDesignResult(null);
    setDesignSummary('');
  }, []);

  // 判断是否有有效设计
  const hasValidDesign = Boolean(
    extractedDesign && 
    extractedDesign.confidence > 0.3 && 
    extractedDesign.missingFields.length <= 1
  );

  return {
    extractedDesign,
    designParams,
    designResult,
    designSummary,
    isExtracting,
    hasValidDesign,
    extractFromMessages,
    clearDesign,
  };
}

console.log('=== useDesignContext.ts 加载完成 ===');