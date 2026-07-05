import {
  index,
  route
} from "@react-router/dev/routes";
import type {
  RouteConfig
} from "@react-router/dev/routes";

export default [

  // 工作台同时承载首页和具体会话页；conversationId 由 hook 根据路由参数切换活跃会话。
  index("pages/home/index.tsx"),
  route("favicon.ico", "resources/favicon.ts"),
  route(".well-known/appspecific/com.chrome.devtools.json", "resources/chrome-devtools.ts"),
  route("conversations/:conversationId", "pages/conversations/index.tsx"),

  // 登录和注册独立成页，避免未登录用户加载聊天工作台的大块逻辑。
  route("login", "pages/login/index.tsx"),
  route("register", "pages/register/index.tsx")
] satisfies RouteConfig;
