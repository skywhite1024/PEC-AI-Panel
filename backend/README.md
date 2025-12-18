# FastAPI Backend

最小鉴权服务：手机号+密码 / 手机号+短信验证码（占位）。

## 运行

在项目根目录执行（确保已激活虚拟环境并安装依赖）：
`ash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --reload-dir backend
` 

默认使用 SQLite，本地文件位于 backend/app.db。
