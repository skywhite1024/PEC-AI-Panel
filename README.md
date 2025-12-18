# PEC-AI 电力电子变换器智能设计平台

<div align="center">

**基于大语言模型的 DC-DC 变换器自动化设计系统**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📖 项目简介

PEC-AI（Power Electronics Converter - AI）是一个面向电力电子工程师的智能设计辅助平台，为全国"AI+能源"大学生科技创新竞赛参赛作品。

通过自然语言对话交互，用户无需掌握复杂的参数配置流程，即可快速完成 DC-DC 变换器的设计，并获取包含完整物料清单（BOM）、设计报告和元器件选型说明的专业方案。

### ✨ 核心特性

| 特性                | 描述                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| 🤖 **AI 对话引导**  | 通过多轮智能对话收集设计需求，自动解析拓扑意图、电压等级、功率需求、优化偏好 |
| ⚡ **多拓扑支持**   | 支持 Boost（升压）、Buck（降压）、Buck-Boost（升降压）等主流拓扑结构         |
| 🎯 **多目标优化**   | 支持效率优先、成本优先、体积优先或均衡设计的帕累托优化策略                   |
| 📊 **专业报告生成** | 一键生成 BOM 清单、设计报告、半导体/电感/电容选型报告（PDF/CSV 格式）        |
| 💬 **方案问答**     | 设计完成后进入问答模式，解答控制实现、元器件替换、PCB 布局等专业问题         |
| 🎨 **双模式界面**   | 普通模式（AI 引导）与专业模式（完整参数控制）自由切换                        |
| 🔐 **用户鉴权**     | 支持手机号 + 密码 / 短信验证码登录，JWT Token 认证                           |

---

## 🏗️ 项目结构

```
PEC-AI-Panel/
├── App.tsx                      # 主应用组件，管理对话流程与界面状态
├── index.tsx                    # React 应用入口
├── index.html                   # HTML 模板（含 TailwindCSS 配置）
├── vite.config.ts               # Vite 构建配置
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 前端依赖管理
├── AGENTS.md                    # 项目协作指南
│
├── components/                  # UI 组件
│   ├── DownloadPanel.tsx        # 方案下载面板（生成进度、文件下载）
│   ├── ProfessionalPanel.tsx    # 专业模式参数配置面板
│   ├── PanelComponents.tsx      # 通用面板组件（输入框、饼图等）
│   └── ThinkingBlock.tsx        # AI 思考过程展示组件
│
├── hooks/                       # 自定义 React Hooks
│   ├── useChat.ts               # 对话状态管理（消息发送、流式响应）
│   ├── useChatHistory.ts        # 对话历史持久化
│   └── useDesignContext.ts      # 设计上下文提取与管理
│
├── services/                    # 业务逻辑服务
│   ├── api.ts                   # AI API 调用（流式/非流式）、输入建议生成
│   ├── designExtractor.ts       # 从对话中提取设计参数
│   └── reportGenerator.ts       # PDF/CSV 报告生成
│
├── image/                       # 静态图片资源（拓扑电路图等）
│
└── backend/                     # FastAPI 鉴权后端
    ├── main.py                  # 应用入口与 CORS 配置
    ├── db.py                    # SQLAlchemy 数据库连接
    ├── deps.py                  # 依赖注入
    ├── schemas.py               # Pydantic 数据模型
    ├── requirements.txt         # Python 依赖
    ├── app.db                   # SQLite 数据库（自动生成）
    ├── api/
    │   └── auth.py              # 鉴权路由（注册/登录/短信）
    ├── core/
    │   ├── config.py            # 配置管理
    │   ├── security.py          # JWT 与密码哈希
    │   └── sms.py               # 短信验证码逻辑
    └── models/
        ├── user.py              # 用户模型
        └── sms.py               # 验证码模型
```

---

## 🚀 快速开始

### 环境要求

- **前端**: Node.js ≥ 18, npm ≥ 9
- **后端**: Python ≥ 3.10

### 前端安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
# 访问 http://localhost:5173

# 3. 构建生产版本
npm run build
# 产物位于 dist/ 目录
```

### 后端安装与运行

```bash
# 1. 安装 Python 依赖
pip install -r backend/requirements.txt

# 2. 启动后端服务
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 访问 API 文档: http://127.0.0.1:8000/docs
```

---

## 🔧 技术架构

### 前端技术栈

| 技术         | 版本  | 用途                 |
| ------------ | ----- | -------------------- |
| React        | 18.x  | UI 框架              |
| TypeScript   | 5.x   | 类型安全             |
| Vite         | 5.x   | 构建工具             |
| TailwindCSS  | 3.x   | 样式系统             |
| Lucide React | -     | 图标库               |
| jsPDF        | 2.5.x | PDF 生成（CDN 加载） |

### 后端技术栈

| 技术        | 版本    | 用途               |
| ----------- | ------- | ------------------ |
| FastAPI     | 0.111.x | Web 框架           |
| SQLAlchemy  | 2.0.x   | ORM                |
| Pydantic    | 2.7.x   | 数据验证           |
| python-jose | 3.3.x   | JWT 处理           |
| passlib     | 1.7.x   | 密码哈希（bcrypt） |
| SQLite      | -       | 默认数据库         |

### AI 服务

项目通过 [ModelScope](https://api-inference.modelscope.cn) 调用大语言模型：

```typescript
// services/api.ts
const API_URL = "https://api-inference.modelscope.cn/v1/chat/completions";
const MODEL = "deepseek-ai/DeepSeek-V3.2-Exp";
```

支持的功能：

- **流式响应**: 实时展示 AI 回复，支持思考过程（reasoning_content）可视化
- **双模式提示词**: 设计引导模式（DESIGN_GUIDE_PROMPT）与问答模式（QA_MODE_PROMPT）
- **智能建议**: 根据 AI 提问自动生成用户输入建议

---

## 📋 功能模块详解

### 1. 信息输入模块（AI 对话引导）

通过自然语言对话收集设计参数：

```
对话流程：
┌─────────────────────────────────────────────────┐
│ 第一阶段 - 基础信息收集                           │
│   1. 拓扑类型 → Boost / Buck / Buck-Boost        │
│   2. 输入电压 → 如 48V 或 36V-60V 范围            │
│   3. 输出电压 → 如 100V                          │
│   4. 输出功率 → 如 500W                          │
├─────────────────────────────────────────────────┤
│ 第二阶段 - 设计偏好确认                           │
│   → 效率优先 / 成本优先 / 体积优先 / 均衡设计      │
├─────────────────────────────────────────────────┤
│ 第三阶段 - 参数确认                              │
│   → AI 总结所有参数并等待用户确认                 │
├─────────────────────────────────────────────────┤
│ 第四阶段 - 方案生成                              │
│   → 用户确认后触发多目标优化                      │
└─────────────────────────────────────────────────┘
```

### 2. 专业模式（完整参数控制）

专业用户可直接配置：

- **拓扑选择**: Buck / Boost / Buck-Boost
- **调制方案**: CCM / DCM / BCM
- **半导体技术**: Si / GaN / SiC
- **磁芯材料**: Ferrite / Powder Core / Amorphous
- **扫描范围**: 输入电压范围、输出功率范围、采样点数
- **优化权重**: 效率 / 成本 / 体积权重配比
- **全局变量**: 开关频率、电感系数、环境温度等

### 3. 方案生成模块

参数确认后触发 6 步优化流程：

1. 半导体器件迭代优化
2. 电感参数迭代优化
3. 电容参数迭代优化
4. 系统组合优化
5. 帕累托前沿筛选
6. 报告生成与打包

### 4. 报告下载模块

| 文件             | 格式 | 内容                                 |
| ---------------- | ---- | ------------------------------------ |
| 物料清单 (BOM)   | CSV  | 元器件型号、参数、数量、单价、总价   |
| 完整设计报告     | PDF  | 系统规格、损耗分析、热分析、KPI 指标 |
| 半导体选型报告   | PDF  | MOSFET/二极管选型、热设计、损耗计算  |
| 磁性元件设计报告 | PDF  | 电感磁芯、匝数、绕组、损耗分析       |
| 电容选型报告     | PDF  | 输入/输出电容选型、纹波计算          |

### 5. 问答模块

设计完成后自动切换至问答模式，可回答：

- **控制实现**: PWM 策略、PI/PID 参数、补偿网络、MCU 代码
- **元器件替换**: 替代型号推荐、性能影响分析、成本对比
- **设计原理**: 拓扑选择依据、损耗计算原理、热设计考量
- **优化建议**: 效率提升、成本优化、EMC 设计
- **实际应用**: PCB 布局、测试方法、调试技巧、故障排查

---

## 🔐 鉴权接口

### 短信验证码

```bash
POST /auth/sms/send
Content-Type: application/json

{
  "phone": "13800138000",
  "purpose": "login"  # login / register / reset
}

# 开发模式响应直接包含验证码
```

### 用户注册

```bash
POST /auth/register
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "your_password",  # ≥6 位
  "sms_code": "123456"
}
```

### 用户登录

```bash
# 密码登录
POST /auth/login
{
  "phone": "13800138000",
  "password": "your_password"
}

# 短信验证码登录（不提供 password）
POST /auth/login
{
  "phone": "13800138000",
  "sms_code": "123456"
}
```

### 获取用户信息

```bash
GET /auth/me
Authorization: Bearer <access_token>
```

---

## ⚙️ 配置说明

### 前端配置

在项目根目录创建 `.env.local`（可选）：

```env
# 自定义 AI API Key（默认使用内置 Key）
VITE_API_KEY=your-modelscope-api-key
```

### 后端配置

在 backend 目录创建 `.env`：

```env
SECRET_KEY=your-secret-key-change-in-production
DB_URL=sqlite:///./app.db
```

### TailwindCSS 主题色

```javascript
// index.html
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#5B5FC7", // 主色调（紫色）
        panel: "#EEF2FF", // 面板背景
        input: "#F3F6F8", // 输入框背景
      },
    },
  },
};
```

---

## 🛠️ 开发要点

### 代码分层

```
界面层 (App.tsx, components/)
    ↓ 调用
状态层 (hooks/)
    ↓ 调用
服务层 (services/)
    ↓ 调用
外部 API (ModelScope / Backend)
```

### 设计原则

- **KISS/DRY/SOLID**: 单一职责，复用 hooks/services，避免重复逻辑
- **UI 一致性**: 保持紫色系 `#5B5FC7`，圆角风格，移动端适配
- **安全**: 密码仅存哈希，验证码 6 位数字，敏感配置用环境变量
- **类型安全**: 充分利用 TypeScript 接口定义

---

## 🐛 调试工具

### 查看数据库用户

```bash
python backend/check_users.py
```

### 查看密码哈希（仅调试）

```bash
python backend/inspect_passwords.py
```

### 常见问题

| 问题     | 解决方案   |
| -------- | ---------- |
| 端口占用 | 确认无残留 |
