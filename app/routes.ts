import {
  index,
  route
} from "@react-router/dev/routes";
import type {
  RouteConfig
} from "@react-router/dev/routes";

export default [
  index("pages/home/index.tsx"),
  route("login", "pages/login/index.tsx"),
  route("register", "pages/register/index.tsx")
] satisfies RouteConfig;
