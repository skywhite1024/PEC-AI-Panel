// services/api.ts
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  choices: {
    message: {
      content: string;
    };
    delta?: {
      content?: string;
    };
  }[];
}

// 魔塔社区 API 配置
// 注意：API Key 不需要 'sk-' 前缀，直接使用完整 token
const API_KEY = 'ms-88261760-4c02-4a0d-99ac-635693f9bacf';
const API_URL = 'https://api-inference.modelscope.cn/v1/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-V3.2-Exp';

// 系统提示词 - 定义 AI 角色
const SYSTEM_PROMPT = `你是 PEC-AI，一个专业的电力电子变换器设计助手。你的职责是：
1. 帮助用户设计各种电力电子变换器（DC/DC、DC/AC、AC/DC等）
2. 提供专业的电路拓扑建议
3. 协助计算电气参数（电压、电流、功率、效率等）
4. 解答关于开关电源、逆变器、充电器等设计问题
5. 提供元器件选型建议

请用专业但易懂的语言回答用户问题，必要时可以使用公式和数据说明。回答要简洁明了，分点列出关键信息。`;

export async function sendMessage(messages: Message[]): Promise<string> {
  try {
    console.log('发送请求到:', API_URL);
    console.log('使用模型:', MODEL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 错误响应:', errorText);
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const data: ChatResponse = await response.json();
    console.log('API 响应成功');
    return data.choices[0]?.message?.content || '抱歉，我没有收到有效的回复。';
  } catch (error) {
    console.error('API 调用错误:', error);
    throw error;
  }
}

// 流式响应版本（打字机效果）
export async function sendMessageStream(
  messages: Message[],
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') {
          continue;
        }
        
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6);
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // 忽略 JSON 解析错误
            console.debug('JSON 解析跳过:', data);
          }
        }
      }
    }
    
    onDone();
  } catch (error) {
    console.error('流式 API 调用错误:', error);
    throw error;
  }
}