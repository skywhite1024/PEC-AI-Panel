// services/designExtractor.ts
import { DesignParams, DesignResult } from './reportGenerator';

console.log('=== designExtractor.ts 开始加载 ===');

// 本地定义 ChatMessage 接口，避免循环导入
export interface ChatMessageForExtract {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// 从对话中提取的设计需求
export interface ExtractedDesign {
  topology: string;
  inputVoltage: number;
  inputVoltageMin?: number;
  inputVoltageMax?: number;
  outputVoltage: number;
  outputPower: number;
  outputPowerMin?: number;
  outputPowerMax?: number;
  efficiencyTarget?: number;
  rippleMax?: number;
  priority: 'efficiency' | 'cost' | 'volume' | 'balanced';
  maxAmbientTemp?: number;
  maxJunctionTemp?: number;
  switchingFreqMin?: number;
  switchingFreqMax?: number;
  application?: string;
  confidence: number;
  missingFields: string[];
}

// 默认设计参数
const DEFAULT_EXTRACTED: ExtractedDesign = {
  topology: 'boost',
  inputVoltage: 48,
  outputVoltage: 100,
  outputPower: 500,
  priority: 'balanced',
  confidence: 0,
  missingFields: ['inputVoltage', 'outputVoltage', 'outputPower'],
};

// 从AI总结的参数表格中提取信息
function extractFromAISummary(text: string): Partial<ExtractedDesign> {
  const result: Partial<ExtractedDesign> = {};
  
  // 提取拓扑结构 - 从AI确认的表格中
  // 匹配格式如: "拓扑结构：Boost" 或 "推荐拓扑：Boost (CCM)" 或 "Boost拓扑"
  const topologyPatterns = [
    /拓扑[结构型]*[：:]\s*(Boost|Buck|Buck-Boost|boost|buck|buck-boost)/i,
    /推荐拓扑[：:]\s*(Boost|Buck|Buck-Boost|boost|buck|buck-boost)/i,
    /(Boost|Buck|Buck-Boost)\s*[（(]?CCM[)）]?/i,
    /采用\s*(Boost|Buck|Buck-Boost|升压|降压|升降压)/i,
    /选择\s*(Boost|Buck|Buck-Boost|升压|降压|升降压)/i,
  ];
  
  for (const pattern of topologyPatterns) {
    const match = text.match(pattern);
    if (match) {
      const topo = match[1].toLowerCase();
      if (topo.includes('boost') || topo.includes('升压')) {
        result.topology = 'boost';
      } else if (topo.includes('buck-boost') || topo.includes('升降压')) {
        result.topology = 'buck-boost';
      } else if (topo.includes('buck') || topo.includes('降压')) {
        result.topology = 'buck';
      }
      break;
    }
  }
  
  // 提取输入电压范围 - 从AI确认的表格中
  // 匹配格式如: "输入电压：40V - 55V" 或 "输入电压范围(Vin)：40 V - 55 V"
  const inputVoltagePatterns = [
    /输入电压[范围]*[（(]?[Vv]in[)）]?[：:]\s*(\d+)\s*[Vv]?\s*[-~到至]\s*(\d+)\s*[Vv]?/i,
    /输入电压[：:]\s*(\d+)\s*[Vv]?\s*[-~到至]\s*(\d+)\s*[Vv]?/i,
    /[Vv]in[：:]\s*(\d+)\s*[Vv]?\s*[-~到至]\s*(\d+)\s*[Vv]?/i,
  ];
  
  for (const pattern of inputVoltagePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.inputVoltageMin = parseInt(match[1]);
      result.inputVoltageMax = parseInt(match[2]);
      result.inputVoltage = result.inputVoltageMin;
      break;
    }
  }
  
  // 如果没有范围，尝试提取单个输入电压值
  if (!result.inputVoltage) {
    const singleInputMatch = text.match(/输入电压[：:]\s*(\d+)\s*[Vv]/i);
    if (singleInputMatch) {
      result.inputVoltage = parseInt(singleInputMatch[1]);
    }
  }
  
  // 提取输出电压
  const outputVoltagePatterns = [
    /输出电压[（(]?[Vv]out[)）]?[：:]\s*(\d+)\s*[Vv]?/i,
    /输出电压[：:]\s*(\d+)\s*[Vv]?/i,
    /[Vv]out[：:]\s*(\d+)\s*[Vv]?/i,
  ];
  
  for (const pattern of outputVoltagePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.outputVoltage = parseInt(match[1]);
      break;
    }
  }
  
  // 提取输出功率
  const outputPowerPatterns = [
    /输出功率[（(]?[Pp]out[)）]?[：:]\s*(\d+)\s*[Ww]?/i,
    /输出功率[：:]\s*(\d+)\s*[Ww]?/i,
    /最大输出功率[：:]\s*(\d+)\s*[Ww]?/i,
    /功率[：:]\s*(\d+)\s*[Ww]?/i,
    /[Pp]out[：:]\s*(\d+)\s*[Ww]?/i,
  ];
  
  for (const pattern of outputPowerPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.outputPower = parseInt(match[1]);
      break;
    }
  }
  
  // 提取优化目标
  const priorityPatterns = [
    /优化目标[：:]\s*(效率优先|成本优先|体积优先|均衡设计|均衡)/i,
    /设计目标[：:]\s*(效率优先|成本优先|体积优先|均衡设计|均衡)/i,
  ];
  
  for (const pattern of priorityPatterns) {
    const match = text.match(pattern);
    if (match) {
      const target = match[1];
      if (target.includes('效率')) {
        result.priority = 'efficiency';
      } else if (target.includes('成本')) {
        result.priority = 'cost';
      } else if (target.includes('体积')) {
        result.priority = 'volume';
      } else {
        result.priority = 'balanced';
      }
      break;
    }
  }
  
  // 提取环境温度
  const tempMatch = text.match(/环境温度[：:]\s*(\d+)\s*°?C/i);
  if (tempMatch) {
    result.maxAmbientTemp = parseInt(tempMatch[1]);
  }
  
  // 提取纹波要求
  const rippleMatch = text.match(/纹波[要求]*[：:]\s*(\d+(?:\.\d+)?)\s*%/i);
  if (rippleMatch) {
    result.rippleMax = parseFloat(rippleMatch[1]);
  }
  
  return result;
}

// 从用户对话中提取信息
function extractFromUserMessages(messages: ChatMessageForExtract[]): Partial<ExtractedDesign> {
  const result: Partial<ExtractedDesign> = {};
  const userText = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
  
  // 识别拓扑 - 用户明确说的
  if (userText.includes('升压') || userText.toLowerCase().includes('boost')) {
    result.topology = 'boost';
  } else if (userText.includes('升降压') || userText.toLowerCase().includes('buck-boost')) {
    result.topology = 'buck-boost';
  } else if (userText.includes('降压') || userText.toLowerCase().includes('buck')) {
    result.topology = 'buck';
  }
  
  // 提取电压 - 从用户输入中
  const voltageMatches = userText.match(/(\d+)\s*[Vv]/g) || [];
  const voltages = voltageMatches.map(v => parseInt(v)).filter(v => v > 0 && v < 1000);
  
  // 提取功率
  const powerMatches = userText.match(/(\d+)\s*[Ww瓦]/g) || [];
  const powers = powerMatches.map(p => parseInt(p)).filter(p => p > 0);
  
  if (powers.length > 0) {
    result.outputPower = Math.max(...powers);
  }
  
  // 识别优先级
  if (userText.includes('效率优先') || userText.includes('高效')) {
    result.priority = 'efficiency';
  } else if (userText.includes('成本优先') || userText.includes('便宜') || userText.includes('低价') || userText.includes('成本低')) {
    result.priority = 'cost';
  } else if (userText.includes('体积优先') || userText.includes('紧凑') || userText.includes('小型')) {
    result.priority = 'volume';
  } else if (userText.includes('均衡')) {
    result.priority = 'balanced';
  }
  
  // 尝试识别输入/输出电压
  // 查找电压范围
  const rangeMatch = userText.match(/(\d+)\s*[Vv]?\s*[-~到至]\s*(\d+)\s*[Vv]/);
  if (rangeMatch) {
    result.inputVoltageMin = parseInt(rangeMatch[1]);
    result.inputVoltageMax = parseInt(rangeMatch[2]);
    result.inputVoltage = result.inputVoltageMin;
  } else if (voltages.length >= 2) {
    // 如果有多个电压值，根据拓扑判断输入输出
    const sorted = [...voltages].sort((a, b) => a - b);
    if (result.topology === 'boost' || !result.topology) {
      // 升压：输入小于输出
      result.inputVoltage = sorted[0];
      result.outputVoltage = sorted[sorted.length - 1];
    } else if (result.topology === 'buck') {
      // 降压：输入大于输出
      result.inputVoltage = sorted[sorted.length - 1];
      result.outputVoltage = sorted[0];
    }
  }
  
  return result;
}

// 综合提取函数
function comprehensiveExtract(messages: ChatMessageForExtract[]): ExtractedDesign {
  // 1. 首先从AI的回复中提取（优先级最高，因为AI会确认参数）
  const aiText = messages.filter(m => m.role === 'assistant').map(m => m.content).join(' ');
  const aiExtracted = extractFromAISummary(aiText);
  
  // 2. 然后从用户输入中提取
  const userExtracted = extractFromUserMessages(messages);
  
  // 3. 合并结果，AI确认的优先
  const merged: ExtractedDesign = {
    ...DEFAULT_EXTRACTED,
    ...userExtracted,
    ...aiExtracted,  // AI确认的会覆盖用户的
  };
  
  // 4. 计算缺失字段和置信度
  const missingFields: string[] = [];
  if (!merged.inputVoltage && !merged.inputVoltageMin) missingFields.push('inputVoltage');
  if (!merged.outputVoltage) missingFields.push('outputVoltage');
  if (!merged.outputPower) missingFields.push('outputPower');
  
  merged.missingFields = missingFields;
  merged.confidence = missingFields.length === 0 ? 0.9 : 
                      missingFields.length === 1 ? 0.6 : 0.3;
  
  console.log('综合提取结果:', {
    aiExtracted,
    userExtracted,
    merged
  });
  
  return merged;
}

// 从对话中提取设计参数 - 主函数
export async function extractDesignFromChat(messages: ChatMessageForExtract[]): Promise<ExtractedDesign> {
  console.log('extractDesignFromChat 被调用, 消息数:', messages.length);
  
  if (messages.length === 0) {
    return DEFAULT_EXTRACTED;
  }

  try {
    const extracted = comprehensiveExtract(messages);
    console.log('最终提取结果:', extracted);
    return extracted;
  } catch (error) {
    console.error('提取设计参数失败:', error);
    return DEFAULT_EXTRACTED;
  }
}

// 将提取的设计转换为报告生成所需的参数格式
export function convertToDesignParams(extracted: ExtractedDesign): DesignParams {
  console.log('convertToDesignParams 被调用, 输入:', extracted);
  
  const result: DesignParams = {
    inputVoltage: String(extracted.inputVoltage || 48),
    outputVoltage: String(extracted.outputVoltage || 100),
    outputPower: String(extracted.outputPower || 500),
    vInMin: String(extracted.inputVoltageMin || Math.round((extracted.inputVoltage || 48) * 0.85)),
    vInMax: String(extracted.inputVoltageMax || Math.round((extracted.inputVoltage || 48) * 1.15)),
    vInPoints: '4',
    pOutMin: String(extracted.outputPowerMin || Math.round((extracted.outputPower || 500) * 0.1)),
    pOutMax: String(extracted.outputPowerMax || extracted.outputPower || 500),
    pOutPoints: '5',
    effWeight: extracted.priority === 'efficiency' ? '60' : 
               extracted.priority === 'cost' ? '20' : 
               extracted.priority === 'volume' ? '20' : '33.3',
    costWeight: extracted.priority === 'cost' ? '60' : 
                extracted.priority === 'efficiency' ? '20' : 
                extracted.priority === 'volume' ? '20' : '33.3',
    volWeight: extracted.priority === 'volume' ? '60' : 
               extracted.priority === 'efficiency' ? '20' : 
               extracted.priority === 'cost' ? '20' : '33.3',
    freq: String(extracted.switchingFreqMin || 50000),
    inductance: '20e-6',
    maxAmbTemp: String(extracted.maxAmbientTemp || 50),
    maxJuncTemp: String(extracted.maxJunctionTemp || 125),
    maxCoreTemp: '100',
    ripple: String(extracted.rippleMax || 1.0),
    lRatio: '0.75',
  };
  
  console.log('转换后的设计参数:', result);
  return result;
}

// 生成设计方案摘要
export function generateDesignSummary(extracted: ExtractedDesign, result: DesignResult): string {
  console.log('generateDesignSummary 被调用');
  
  const topologyName: Record<string, string> = {
    'boost': '升压变换器 (Boost)',
    'buck': '降压变换器 (Buck)',
    'buck-boost': '升降压变换器 (Buck-Boost)',
  };

  const priorityName: Record<string, string> = {
    'efficiency': '效率优先',
    'cost': '成本优先',
    'volume': '体积优先',
    'balanced': '均衡设计',
  };

  const inputVoltageStr = extracted.inputVoltageMin && extracted.inputVoltageMax 
    ? `${extracted.inputVoltageMin}V ~ ${extracted.inputVoltageMax}V`
    : `${extracted.inputVoltage}V`;

  return `
设计方案摘要

系统规格
- 拓扑结构: ${topologyName[extracted.topology] || extracted.topology}
- 输入电压: ${inputVoltageStr}
- 输出电压: ${extracted.outputVoltage}V
- 输出功率: ${extracted.outputPower}W

优化目标
- 策略: ${priorityName[extracted.priority]}

性能指标
- 效率: ${result.efficiency.toFixed(2)}%
- 成本: ¥${result.cost}
- 体积: ${result.volume} dm³
`.trim();
}

console.log('=== designExtractor.ts 加载完成 ===');