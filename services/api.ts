// services/api.ts
console.log('=== api.ts 开始加载 ===');

// 消息类型定义
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 流式响应回调
export interface StreamCallbacks {
  onThinking?: (thinking: string) => void;
  onContent?: (content: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

// 魔塔社区 API 配置
const API_KEY = 'ms-88261760-4c02-4a0d-99ac-635693f9bacf';
const API_URL = 'https://api-inference.modelscope.cn/v1/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-V3.2-Exp';

// 设计引导系统提示词
const DESIGN_GUIDE_PROMPT = `你是 PEC-AI，一个专业的电力电子变换器设计助手。你的任务是通过友好的多轮对话，引导用户完善设计需求。

【重要格式要求】
1. 禁止使用 Markdown 格式，不要使用 #、##、**、- 等符号
2. 使用纯文本回复，段落之间用空行分隔
3. 列表使用数字序号（1. 2. 3.）或中文序号（一、二、三）
4. 保持回复简洁友好，像与同事交流一样自然

【对话流程】
第一阶段 - 基础信息收集：
1. 确认拓扑类型（升压Boost/降压Buck/升降压Buck-Boost等）
2. 确认输入电压或电压范围
3. 确认输出电压
4. 确认输出功率

第二阶段 - 设计偏好确认：
1. 询问优化目标偏好（效率优先/成本优先/体积优先/均衡设计）
2. 如果用户不确定，默认使用"均衡设计"

第三阶段 - 参数确认：
当收集到足够信息后，用纯文本表格形式总结所有参数，格式如下：

设计参数确认
------------------
项目名称：XXX变换器
拓扑结构：Boost (CCM)
输入电压：XX V - XX V
输出电压：XX V
输出功率：XX W
优化目标：均衡设计
环境温度：50°C（默认值）
纹波要求：1%（默认值）
------------------

请确认以上参数是否正确？如需修改请告诉我具体项目和期望值。

第四阶段 - 生成方案询问（重要！）：
当用户确认参数无误后（用户说"确认"、"没问题"、"可以"、"好的"等），你必须询问：

"太好了！所有设计参数已确认完毕。

现在我可以为您生成完整的设计方案，包括：
1. 物料清单（BOM）- 包含所有推荐元器件型号和价格
2. 设计报告 - 包含系统规格、损耗分析、热分析
3. 元器件详细报告 - 半导体、电感、电容的详细选型说明

请问是否需要我立即生成可下载的设计方案？"

【交互原则】
1. 每次只问1-2个问题，不要一次问太多
2. 对用户的模糊描述给出合理的默认建议
3. 使用温和友好的语气
4. 当信息足够时主动总结确认
5. 用户确认参数后，必须询问是否生成下载方案
6. 当用户说"生成"、"下载"、"好的，生成吧"等时，回复"好的，正在为您生成设计方案，请稍候..."

【关键触发词识别】
- 用户确认参数时的词：确认、没问题、可以、好的、对的、正确、OK、就这样
- 用户要求生成方案时的词：生成、下载、开始、好的生成吧、需要、是的、要`;

// 清理 Markdown 符号
function cleanMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '· ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .trim();
}

// 检查 AI 回复是否在询问生成方案
export function checkAskingForGeneration(aiResponse: string): boolean {
  const askKeywords = [
    '是否需要我立即生成',
    '是否生成',
    '需要生成',
    '生成可下载',
    '生成设计方案',
    '是否需要.*生成',
    '可以为您生成'
  ];
  return askKeywords.some(keyword => new RegExp(keyword).test(aiResponse));
}

// 检查用户是否要求生成方案
export function checkUserWantsGeneration(userMessage: string): boolean {
  const generateKeywords = [
    '生成', '下载', '好的，生成', '是的', '需要', '要', '开始生成',
    '生成方案', '下载方案', '好的生成吧', '可以生成', '请生成',
    '立即生成', '马上生成', '现在生成'
  ];
  return generateKeywords.some(keyword => userMessage.includes(keyword));
}

// 检查用户是否确认了设计参数
export function checkDesignConfirmation(userMessage: string): boolean {
  const confirmKeywords = ['确认', '没问题', '可以', '好的', '对的', '正确', 'ok', 'OK', '就这样', '开始设计'];
  return confirmKeywords.some(keyword => userMessage.includes(keyword));
}

// 流式发送消息
export async function sendMessageStream(
  messages: Message[],
  callbacks: StreamCallbacks
): Promise<void> {
  console.log('sendMessageStream 被调用');
  
  const requestBody = {
    model: MODEL,
    messages: [
      { role: 'system', content: DESIGN_GUIDE_PROMPT },
      ...messages
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 8000,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let thinkingContent = '';
    let mainContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            callbacks.onDone?.();
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta) {
              if (delta.reasoning_content) {
                thinkingContent += delta.reasoning_content;
                callbacks.onThinking?.(thinkingContent);
              }
              
              if (delta.content) {
                mainContent += delta.content;
                callbacks.onContent?.(cleanMarkdown(mainContent));
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    if (!mainContent && !thinkingContent) {
      callbacks.onError?.(new Error('未收到有效响应'));
    }

  } catch (error) {
    console.error('流式请求失败:', error);
    callbacks.onError?.(error instanceof Error ? error : new Error('请求失败'));
  }
}

// 非流式发送消息
export async function sendMessage(
  messages: Message[],
  mode: 'design' | 'general' = 'design'
): Promise<string> {
  console.log('sendMessage 被调用');
  
  const requestBody = {
    model: MODEL,
    messages: [
      { role: 'system', content: DESIGN_GUIDE_PROMPT },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 8000,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';
    
    return cleanMarkdown(content);
  } catch (error) {
    console.error('API 调用失败:', error);
    throw error;
  }
}

console.log('=== api.ts 加载完成 ===');