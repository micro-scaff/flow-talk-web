# flow-talk-web

Flow Talk 前端项目，面向即时通讯场景。当前阶段先完成账号注册、账号登录、主题切换和认证接口联调，为后续 IM 会话、联系人和消息模块打基础。

## 技术栈

- React 19
- React Router 8 Framework Mode
- TypeScript
- Vite
- Ant Design
- `@mt-kit/request-axios`
- `@mt-kit/eslint-config`

## 接口来源

后端接口文档来自：

```txt
/Users/liyong/Desktop/code/flow-talk-server/docs/openapi.json
```

当前已接入接口：

- `POST /api/auth/login`
- `POST /api/auth/register`

本地开发接口地址：

```txt
http://127.0.0.1:8080
```

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

默认访问：

```txt
http://localhost:5173/
```

## 常用命令

类型检查：

```bash
npm run typecheck
```

代码自动修复：

```bash
npm run fix
```

生产构建：

```bash
npm run build
```

## 当前页面

- `/`：跳转到登录页
- `/login`：登录
- `/register`：注册

## 代码结构

```txt
app/
  api/                  具体业务接口
  components/           公共组件
  hooks/                跨模块复用 hooks
  model/                共享数据模型
  pages/                页面与页面私有组件
  request/              请求公共实例、拦截器和 token 处理
```

模块私有 hooks 放在对应页面目录下，例如：

```txt
app/pages/login/hooks/
app/pages/register/hooks/
```

只有跨模块复用的 hooks 才放在 `app/hooks/`。

项目按 MVVM 思路拆分：

- Model：定义接口字段和业务数据结构
- View：只负责页面和组件展示
- Hooks：页面模块 hooks 管理表单和跳转，公共 hooks 管理跨模块状态
- Request/API：封装 HTTP 客户端、认证接口和本地会话持久化
