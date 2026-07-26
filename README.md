# flow-talk-web

Flow Talk 的 Web 客户端，与 `flow-talk-server` 的 v1-v7 接口和 WebSocket 协议配套使用。

## 已实现能力

- 账号注册、账号密码登录和 `demo` provider 外部身份登录
- 联系人列表、单聊和群聊创建
- 会话列表、未读数、在线状态和断线重连后的状态校准
- 文本与图片消息、乐观发送、ACK 超时 HTTP 兜底和失败重试
- 游标分页加载历史消息、会话内或全局消息搜索
- 会话已读、单条消息回执查看及已读/未读调整
- 群资料、成员、管理员角色和退出群聊管理
- 设备上报、设备列表与删除

接口与协议的完整说明见 [后端总览](../flow-talk-server/docs/OVERVIEW.md) 和 [OpenAPI](../flow-talk-server/docs/openapi.json)。

## 技术栈

- React 19
- React Router 8 Framework Mode
- TypeScript 5
- Vite 8
- Ant Design 6
- Tailwind CSS 4

## 本地配置

需要 Node.js 22.23.0 或更高版本。

复制环境变量示例并按需修改：

```bash
cp .env.example .env
```

接口默认使用当前站点的同源地址：开发环境由 Vite 代理 `/api`，部署后需要由 Web 服务反向代理 `/api`（包括 WebSocket）。

## 启动与校验

```bash
npm install
npm run dev
```

常用校验命令：

```bash
npm run typecheck
npm run build
```

## 主要路由

- `/login`：账号或外部身份登录
- `/register`：注册
- `/`：联系人和会话工作台
- `/conversations/:conversationId`：指定会话

## 目录结构

```text
app/
  api/                  与 OpenAPI 对齐的接口封装
  components/           公共组件
  hooks/                跨模块复用 hooks
  pages/                页面、页面组件及页面状态
  request/              HTTP 客户端、鉴权与错误处理
  utils/                会话、设备和地址等通用工具
```
