import {
  index,
  route
} from "@react-router/dev/routes";
import type {
  RouteConfig
} from "@react-router/dev/routes";

export default [
  index("pages/home/index.tsx"),
  route("favicon.ico", "resources/favicon.ts"),
  route(".well-known/appspecific/com.chrome.devtools.json", "resources/chrome-devtools.ts"),
  route("conversations/:conversationId", "pages/conversations/index.tsx"),
  route("login", "pages/login/index.tsx"),
  route("register", "pages/register/index.tsx")
] satisfies RouteConfig;
