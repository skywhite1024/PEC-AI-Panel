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

// 简单的参数提取函数（从对话文本中提取数字）
function simpleExtract(messages: ChatMessageForExtract[]): ExtractedDesign {
  const text = messages.map(m => m.content).join(' ');
  
  // 提取电压
  const voltageMatches = text.match(/(\d+)\s*[Vv]/g) || [];
  const voltages = voltageMatches.map(v => parseInt(v)).filter(v => v > 0 && v < 1000);
  
  // 提取功率
  const powerMatches = text.match(/(\d+)\s*[Ww]/g) || [];
  const powers = powerMatches.map(p => parseInt(p)).filter(p => p > 0);
  
  // 识别拓扑
  let topology = 'boost';
  if (text.includes('降压') || text.toLowerCase().includes('buck')) {
    topology = 'buck';
  } else if (text.includes('升压') || text.toLowerCase().includes('boost')) {
    topology = 'boost';
  } else if (text.includes('升降压') || text.toLowerCase().includes('buck-boost')) {
    topology = 'buck-boost';
  }
  
  // 识别优先级
  let priority: 'efficiency' | 'cost' | 'volume' | 'balanced' = 'balanced';
  if (text.includes('效率') || text.includes('高效')) {
    priority = 'efficiency';
  } else if (text.includes('成本') || text.includes('便宜') || text.includes('低价')) {
    priority = 'cost';
  } else if (text.includes('体积') || text.includes('紧凑') || text.includes('小型')) {
    priority = 'volume';
  }
  
  const missingFields: string[] = [];
  
  let inputVoltage = 48;
  let outputVoltage = 100;
  let outputPower = 500;
  
  if (voltages.length >= 2) {
    const sorted = [...voltages].sort((a, b) => a - b);
    if (topology === 'boost') {
      inputVoltage = sorted[0];
      outputVoltage = sorted[sorted.length - 1];
    } else {
      inputVoltage = sorted[sorted.length - 1];
      outputVoltage = sorted[0];
    }
  } else if (voltages.length === 1) {
    inputVoltage = voltages[0];
    missingFields.push('outputVoltage');
  } else {
    missingFields.push('inputVoltage', 'outputVoltage');
  }
  
  if (powers.length > 0) {
    outputPower = Math.max(...powers);
  } else {
    missingFields.push('outputPower');
  }
  
  const confidence = missingFields.length === 0 ? 0.8 : 
                     missingFields.length === 1 ? 0.5 : 0.2;
  
  return {
    topology,
    inputVoltage,
    outputVoltage,
    outputPower,
    priority,
    confidence,
    missingFields,
  };
}

// 从对话中提取设计参数
export async function extractDesignFromChat(messages: ChatMessageForExtract[]): Promise<ExtractedDesign> {
  console.log('extractDesignFromChat 被调用, 消息数:', messages.length);
  
  if (messages.length === 0) {
    return DEFAULT_EXTRACTED;
  }

  try {
    const extracted = simpleExtract(messages);
    console.log('提取结果:', extracted);
    return extracted;
  } catch (error) {
    console.error('提取设计参数失败:', error);
    return DEFAULT_EXTRACTED;
  }
}

// 将提取的设计转换为报告生成所需的参数格式
export function convertToDesignParams(extracted: ExtractedDesign): DesignParams {
  console.log('convertToDesignParams 被调用');
  
  return {
    inputVoltage: String(extracted.inputVoltage || 48),
    outputVoltage: String(extracted.outputVoltage || 100),
    outputPower: String(extracted.outputPower || 500),
    vInMin: String(extracted.inputVoltageMin || Math.round(extracted.inputVoltage * 0.85) || 40),
    vInMax: String(extracted.inputVoltageMax || Math.round(extracted.inputVoltage * 1.15) || 55),
    vInPoints: '4',
    pOutMin: String(extracted.outputPowerMin || Math.round(extracted.outputPower * 0.1) || 50),
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
}

// 生成设计方案摘要
export function generateDesignSummary(extracted: ExtractedDesign, result: DesignResult): string {
  console.log('generateDesignSummary 被调用');
  
  const topologyName: Record<string, string> = {
    'boost': 'Boost Converter',
    'buck': 'Buck Converter',
    'buck-boost': 'Buck-Boost Converter',
  };

  const priorityName: Record<string, string> = {
    'efficiency': 'Efficiency First',
    'cost': 'Cost First',
    'volume': 'Volume First',
    'balanced': 'Balanced',
  };

  return `
## Design Summary

### System Specifications
- Topology: ${topologyName[extracted.topology] || extracted.topology}
- Input Voltage: ${extracted.inputVoltage}V
- Output Voltage: ${extracted.outputVoltage}V
- Output Power: ${extracted.outputPower}W

### Optimization
- Strategy: ${priorityName[extracted.priority]}

### Performance
- Efficiency: ${result.efficiency.toFixed(2)}%
- Cost: $${result.cost}
- Volume: ${result.volume} dm³
`.trim();
}

console.log('=== designExtractor.ts 加载完成 ===');