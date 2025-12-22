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

// Auth 相关类型定义

export interface LoginRequest {
  phone: string;
  password?: string;
  code?: string;
  type: 'password' | 'code';
}

export interface RegisterRequest {
  phone: string;
  password: string;
  code: string;
}

export interface SendCodeRequest {
  phone: string;
  type: 'login' | 'register';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: string;
      phone: string;
      name: string;
    };
  };
  message?: string;
}

export interface CodeResponse {
  success: boolean;
  message?: string;
}

// 魔塔社区 API 配置
const API_KEY = 'ms-88261760-4c02-4a0d-99ac-635693f9bacf';
const API_URL = 'https://api-inference.modelscope.cn/v1/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-V3.2';
// const MODEL = 'Qwen/Qwen3-235B-A22B-Instruct-2507';

// 设计引导系统提示词（信息输入模式）
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

// 用户提问系统提示词（方案问答模式）
const QA_MODE_PROMPT = `你是 PEC-AI，一个专业的电力电子变换器设计问答助手。用户已经完成了一个设计方案的生成，现在进入问答阶段。

【当前设计方案背景】
用户已完成以下设计：
- 这是一个已经生成的电力电子变换器设计方案
- 包含完整的BOM、设计报告和元器件选型
- 用户可能会询问关于控制实现、元器件替换、设计原理等问题

【重要格式要求】
1. 禁止使用 Markdown 格式，不要使用 #、##、**、- 等符号
2. 使用纯文本回复，段落之间用空行分隔
3. 列表使用数字序号（1. 2. 3.）
4. 保持回复专业但友好

【你可以回答的问题类型】
1. 控制实现相关：
   - PWM控制策略
   - PI/PID参数设计
   - 补偿网络设计
   - MCU代码实现建议

2. 元器件替换相关：
   - 推荐替代型号
   - 分析替换后的性能影响（效率、温升变化）
   - 成本对比
   - 供应链建议

3. 设计原理解释：
   - 为什么选择这个拓扑
   - 为什么选择这个MOSFET/二极管
   - 损耗计算原理
   - 热设计考量

4. 优化建议：
   - 如何进一步提高效率
   - 如何降低成本
   - 如何减小体积
   - EMC设计建议

5. 实际应用问题：
   - PCB布局建议
   - 测试方法
   - 调试技巧
   - 常见故障排查

【回复风格】
1. 像一位经验丰富的工程师同事那样回答
2. 提供具体、可操作的建议
3. 如果涉及数值计算，给出具体数值
4. 如果用户问到元器件替换，要说明替换的影响
5. 主动询问是否需要更详细的解释

【示例回复格式】
用户问：这个方案的控制部分具体是怎么实现的？

回复：
很好的问题！这个方案采用的是标准的电压模式控制下的CCM（连续导通模式）。

在您的MCU中，核心控制循环需要做三件事：

1. 采样输出电压：通过ADC读取输出电压的反馈值。

2. PI控制器计算：将反馈值与参考电压进行比较，误差信号输入PI控制器，输出即为所需的占空比D。

3. 生成PWM信号：使用MCU的PWM模块，以设定的频率和计算出的占空比来驱动MOSFET。

推荐的PI参数为：Kp = 0.05, Ki = 500（这些数值需要根据实际系统进行调整）。

您想了解更详细的传递函数推导过程吗？`;

// services/api.ts - 在文件中添加以下内容

// 用于生成输入建议的系统提示词
const SUGGESTION_PROMPT = `你是一个对话建议生成器。根据AI助手的最后一条回复，预测用户最可能的回应。

【任务】
分析AI的回复内容，判断AI在问什么问题，然后生成3个用户最可能给出的简短回答。

【输出格式】
只输出3个建议，每个建议占一行，不要有编号、引号或其他符号。
每个建议应该是用户的直接回答，简洁明了，不超过20个字。

【示例】
如果AI问"请问输出功率是多少？"，你应该输出：
500W
1000W
200W

如果AI问"请确认以上参数是否正确？"，你应该输出：
确认，没问题
参数正确，可以生成
我想修改输出功率

如果AI问"您需要什么类型的拓扑？"，你应该输出：
升压变换器 Boost
降压变换器 Buck
升降压变换器

【注意】
1. 建议必须与AI的提问直接相关
2. 建议应该是用户的回答，不是AI的话
3. 如果AI没有明确提问，返回空`;

// 通过 AI 生成输入建议（异步）
export async function generateInputSuggestionAsync(messages: Message[]): Promise<string[]> {
  if (messages.length === 0) return [];
  
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'assistant') return [];
  
  // 检查AI回复中是否有问号，如果没有问号可能不需要建议
  if (!lastMessage.content.includes('？') && !lastMessage.content.includes('?')) {
    return [];
  }
  
  try {
    const requestBody = {
      model: MODEL,
      messages: [
        { role: 'system', content: SUGGESTION_PROMPT },
        { role: 'user', content: `AI助手的回复：\n${lastMessage.content}\n\n请生成3个用户可能的回答建议：` }
      ],
      temperature: 0.7,
      max_tokens: 200,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('建议生成API请求失败:', response.status);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // 解析返回的建议（按行分割，过滤空行）
    const suggestions = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.length <= 30)  // 过滤空行和过长的内容
      .slice(0, 3);  // 最多3个建议
    
    console.log('AI生成的建议:', suggestions);
    return suggestions;
    
  } catch (error) {
    console.error('生成建议失败:', error);
    return [];
  }
}

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

// 对话模式类型
export type ChatMode = 'design' | 'qa';

// 流式发送消息
export async function sendMessageStream(
  messages: Message[],
  callbacks: StreamCallbacks,
  mode: ChatMode = 'design',
  designContext?: string  // 可选的设计上下文，用于问答模式
): Promise<void> {
  console.log('sendMessageStream 被调用, 模式:', mode);
  
  let systemPrompt = mode === 'design' ? DESIGN_GUIDE_PROMPT : QA_MODE_PROMPT;
  
  // 如果是问答模式且有设计上下文，附加到系统提示词中
  if (mode === 'qa' && designContext) {
    systemPrompt = systemPrompt + `\n\n【当前设计方案详情】\n${designContext}`;
  }
  
  const requestBody = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
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
  mode: ChatMode = 'design'
): Promise<string> {
  console.log('sendMessage 被调用, 模式:', mode);
  
  const systemPrompt = mode === 'design' ? DESIGN_GUIDE_PROMPT : QA_MODE_PROMPT;
  
  const requestBody = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
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

// 根据对话上下文生成输入建议
// services/api.ts - 替换原有的 generateInputSuggestion 函数
export function generateInputSuggestion(messages: Message[]): string[] {
  if (messages.length === 0) return [];
  
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'assistant') return [];
  
  const content = lastMessage.content;
  const contentLower = content.toLowerCase();
  const suggestions: string[] = [];
  
  // 获取所有历史对话内容，用于判断哪些信息已经收集了
  const allContent = messages.map(m => m.content).join(' ').toLowerCase();
  
  // 检查是否已经确认了某些参数
  const hasVoltage = /\d+\s*[vV]/.test(allContent);
  const hasPower = /\d+\s*[wW瓦]/.test(allContent);
  const hasTopology = /boost|buck|升压|降压/.test(allContent);
  
  // ========== 精确匹配 AI 的具体提问 ==========
  
  // AI 询问功率 - 最高优先级匹配
  if (contentLower.includes('功率是多少') || 
      contentLower.includes('输出功率') && contentLower.includes('？') ||
      contentLower.includes('功率需求') ||
      contentLower.includes('多少瓦') ||
      contentLower.includes('功率等级')) {
    suggestions.push('输出功率 500W');
    suggestions.push('1kW');
    suggestions.push('200W');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问输入电压
  if ((contentLower.includes('输入电压') && contentLower.includes('？')) ||
      contentLower.includes('输入电压范围') && contentLower.includes('？') ||
      contentLower.includes('电压范围是多少')) {
    suggestions.push('输入电压 36V - 60V');
    suggestions.push('输入电压 48V');
    suggestions.push('电压范围 40V 到 55V');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问输出电压
  if ((contentLower.includes('输出电压') && contentLower.includes('？')) ||
      contentLower.includes('输出电压是多少') ||
      contentLower.includes('需要输出多少伏')) {
    suggestions.push('输出电压 100V');
    suggestions.push('输出 48V');
    suggestions.push('输出电压 400V');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问拓扑类型
  if (contentLower.includes('拓扑') && contentLower.includes('？') ||
      contentLower.includes('什么类型') ||
      contentLower.includes('哪种电路') ||
      contentLower.includes('选择什么拓扑')) {
    suggestions.push('升压变换器 (Boost)');
    suggestions.push('降压变换器 (Buck)');
    suggestions.push('升降压变换器 (Buck-Boost)');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问优化目标/偏好
  if (contentLower.includes('优化目标') ||
      contentLower.includes('设计偏好') ||
      contentLower.includes('侧重') && contentLower.includes('？') ||
      contentLower.includes('效率') && contentLower.includes('成本') && contentLower.includes('？') ||
      contentLower.includes('优先考虑')) {
    suggestions.push('效率优先');
    suggestions.push('成本优先');
    suggestions.push('均衡设计');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问确认参数
  if (contentLower.includes('确认') && contentLower.includes('参数') ||
      contentLower.includes('是否正确') ||
      contentLower.includes('请确认') ||
      contentLower.includes('以上参数')) {
    suggestions.push('确认，没问题');
    suggestions.push('参数正确');
    suggestions.push('我想修改一下');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问是否生成方案
  if (contentLower.includes('是否需要') && contentLower.includes('生成') ||
      contentLower.includes('生成') && contentLower.includes('方案') && contentLower.includes('？') ||
      contentLower.includes('是否立即生成') ||
      contentLower.includes('可以为您生成')) {
    suggestions.push('好的，请生成方案');
    suggestions.push('是的，生成吧');
    suggestions.push('我想再调整一下');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问应用场景
  if (contentLower.includes('应用场景') ||
      contentLower.includes('用途') && contentLower.includes('？') ||
      contentLower.includes('用在哪')) {
    suggestions.push('光伏储能系统');
    suggestions.push('电动汽车充电');
    suggestions.push('工业电源');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问环境温度
  if (contentLower.includes('环境温度') ||
      contentLower.includes('工作温度') ||
      contentLower.includes('温度范围')) {
    suggestions.push('环境温度 50°C');
    suggestions.push('常温 25°C');
    suggestions.push('高温环境 70°C');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问单相/三相
  if (contentLower.includes('单相') && contentLower.includes('三相') ||
      contentLower.includes('几相')) {
    suggestions.push('单相');
    suggestions.push('三相');
    return suggestions;
  }
  
  // AI 询问并网/离网
  if (contentLower.includes('并网') || contentLower.includes('离网')) {
    suggestions.push('并网型');
    suggestions.push('离网型');
    return suggestions;
  }
  
  // AI 询问开关频率
  if (contentLower.includes('开关频率') ||
      contentLower.includes('频率') && contentLower.includes('？')) {
    suggestions.push('100kHz');
    suggestions.push('50kHz');
    suggestions.push('使用默认频率');
    return suggestions.slice(0, 3);
  }
  
  // AI 询问纹波要求
  if (contentLower.includes('纹波') && contentLower.includes('？')) {
    suggestions.push('纹波小于 1%');
    suggestions.push('纹波小于 5%');
    suggestions.push('使用默认值');
    return suggestions.slice(0, 3);
  }
  
  // ========== 如果没有匹配到具体问题，根据已收集的信息推断 ==========
  
  // 如果 AI 回复中包含"还有什么问题"或类似的结束语
  if (contentLower.includes('还有什么') ||
      contentLower.includes('其他问题') ||
      contentLower.includes('帮您的')) {
    suggestions.push('没有了，谢谢');
    suggestions.push('我想了解更多细节');
    return suggestions;
  }
  
  // 如果没有收集拓扑
  if (!hasTopology && contentLower.includes('？')) {
    suggestions.push('升压变换器');
    return suggestions;
  }
  
  // 如果没有收集电压
  if (!hasVoltage && contentLower.includes('？')) {
    suggestions.push('输入 48V，输出 100V');
    return suggestions;
  }
  
  // 如果没有收集功率
  if (!hasPower && contentLower.includes('？')) {
    suggestions.push('输出功率 500W');
    return suggestions;
  }
  
  // 默认不返回建议（避免不相关的建议）
  return [];
}

// Auth 相关 Mock 接口
export async function login(data: LoginRequest): Promise<AuthResponse> {
  console.log('Login request:', data);
  
  // Mock 实现
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          token: 'mock-token-' + Date.now(),
          user: {
            id: 'user-' + Math.floor(Math.random() * 1000),
            phone: data.phone,
            name: '用户' + data.phone.slice(-4)
          }
        },
        message: '登录成功'
      });
    }, 500);
  });
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  console.log('Register request:', data);
  
  // Mock 实现
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          token: 'mock-token-' + Date.now(),
          user: {
            id: 'user-' + Math.floor(Math.random() * 1000),
            phone: data.phone,
            name: '用户' + data.phone.slice(-4)
          }
        },
        message: '注册成功'
      });
    }, 500);
  });
}

export async function sendCode(data: SendCodeRequest): Promise<CodeResponse> {
  console.log('Send code request:', data);
  
  // Mock 实现
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '验证码发送成功，有效期5分钟'
      });
    }, 300);
  });
}

console.log('=== api.ts 加载完成 ===');