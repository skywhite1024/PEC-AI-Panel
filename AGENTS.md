# 项目协作指南（工程师版）

## Codex 工作规则（必须遵守）

- 修改任何文件：一律用 apply patch（补丁方式）。禁止使用 shell 命令直接编辑文件内容（例如 cat/sed/echo/重定向）。
- 读文件要克制：只读完成任务所需的最少文件；读之前先列清单并说明原因。
- 安全：不要读取/泄露 .env、密钥、token、私钥等；需要时先征求同意并脱敏。
- 先计划后动手：先列出将修改的文件+改动点，我确认后再执行补丁。

## 工作方式

- 优先使用 `apply_patch` 编辑文件；生成类文件（包管理配置等）可用写入脚本或命令。
- 阅读文件前先明确目标，尽量只读相关最少文件；严禁泄露密钥/令牌。
- 提交改动前确保不影响用户未提交的本地修改；避免格式化与功能改动混杂。

## 项目结构

- 前端：`App.tsx` 主流程，`components/` UI，`hooks/` 状态与业务逻辑，`services/` API 与报告生成，`image/` 静态资源。
- 后端：`backend/` FastAPI 鉴权服务（SQLite 默认 `backend/app.db`）；`api/` 路由，`core/` 配置/安全/SMS，`models/` ORM，`schemas.py` 数据模型，调试脚本 `check_users.py`、`inspect_passwords.py`。

## 开发与运行

- 前端：Node.js ≥18，`npm install`，`npm run dev`（5173），`npm run build`（产物 dist）。
- 后端：`pip install -r backend/requirements.txt`，`python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000`。配置在 `backend/.env`（`SECRET_KEY`、`DB_URL`）。Access Token 默认 7 天。

## 鉴权约定

- 短信发送：`POST /auth/sms/send`（开发模式响应包含验证码）。
- 注册：`POST /auth/register`，必须 `phone` + 密码（≥6）+ `sms_code`。
- 登录：优先密码；未提供密码且提供 6 位 `sms_code` 时走短信登录；缺少凭据返回 400；密码错误返回 401。
- 受保护接口：`Authorization: Bearer <access_token>`，`/auth/me`。

## 编码与设计原则

- KISS/DRY/SOLID：拆分单一职责，复用 hooks/services，避免重复逻辑。
- UI：保持现有紫色系与圆角风格；移动端需考虑长按/触控交互。
- 安全：不存明文密码；验证码 6 位数字，限尝试与过期；敏感配置用环境变量。

## 变更与测试

- 重要改动前先简要计划；实现后自测核心路径（登录/短信/前端主要交互）。
- 未配置自动化测试，可用轻量脚本或 curl/Swagger 验证后端接口。

## 提交建议

- 信息简洁聚焦（如 `feat: add sms login flow`、`fix: verify sms code format`）。
- PR/说明包含：变更点、验证方式、受影响模块/接口。
