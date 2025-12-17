# Repository Guidelines

## Codex 工作规则（必须遵守）

- 修改任何文件：一律用 apply patch（补丁方式）。禁止使用 shell 命令直接编辑文件内容（例如 cat/sed/echo/重定向）。
- 读文件要克制：只读完成任务所需的最少文件；读之前先列清单并说明原因。
- 安全：不要读取/泄露 .env、密钥、token、私钥等；需要时先征求同意并脱敏。
- 先计划后动手：先列出将修改的文件+改动点，我确认后再执行补丁。

## 项目结构与模块组织

- 根目录含 `App.tsx`（界面与流程总控）、`index.tsx`/`index.html`（入口）、`vite.config.ts`、`tsconfig.json` 与依赖清单 `package.json`。
- `components/` 存放 UI 组件，`hooks/` 放置自定义状态逻辑，`services/` 负责 API 调用与报表生成，`image/` 维护静态资源，`dist/` 存放构建产物（勿手改）。
- 保持组件/业务逻辑分层：界面层调用 hooks，hooks 调用 services，避免交叉耦合。

## 构建、测试与本地开发

- 环境：Node.js 18+，npm 9+。
- 安装依赖：`npm install`。
- 本地开发：`npm run dev`，默认访问 `http://localhost:5173`。
- 生产构建：`npm run build`，输出到 `dist/`。
- 本地预览产物：`npm run preview`。

## 编码风格与命名

- TypeScript + React，保持 2 空格缩进、单引号、函数式组件为主；统一使用 ES 模块。
- 组件文件与导出的 React 组件使用帕斯卡命名（如 `DownloadPanel.tsx`）；hooks 以 `use` 开头的驼峰命名（如 `useChatHistory.ts`）；服务与工具采用动词或名词短语驼峰命名。
- 保持单一职责：UI 仅渲染与交互，数据/副作用放入 hooks 或 services；避免重复代码，抽取可复用逻辑。

## 测试指南

- 当前未配置自动化测试脚本；新增测试时建议使用 Vite 生态（如 Vitest + React Testing Library），测试文件命名为 `*.test.ts`/`*.test.tsx`，与被测文件同目录或置于 `__tests__/`。
- 优先验证核心流程：对话输入/切换、报告生成、下载面板交互。确保新增 API 调用做错误处理和空状态覆盖。

## 提交与 Pull Request

- 提交信息建议使用简洁英文动词短语，推荐遵循 Conventional Commits（如 `feat: add qa mode switch`、`fix: handle stream error`）。
- PR 应包含：变更摘要、测试验证说明（命令或截图）、受影响的界面/接口列表、关联问题编号（若有）。保持改动聚焦单一主题，避免将格式化与功能改动混杂。

## 安全与配置提示

- API 密钥等敏感信息放入 `.env.local`（例：`VITE_API_KEY`），勿提交到版本库；确认 `.gitignore` 覆盖 `node_modules/`、`dist/` 等生成内容。
- 外部请求集中在 `services/api.ts`，新增接口时遵循现有封装模式（统一错误处理、流式与非流式区分）。
