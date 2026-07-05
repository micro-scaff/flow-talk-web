import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "react-router";
import type {
  ReactElement,
  ReactNode
} from "react";

import type {
  Route
} from "./+types/root";
import "antd/dist/reset.css";
import "./app.css";
import {
  ThemeProvider
} from "./hooks/use-theme-hook";

export const links: Route.LinksFunction = () => {

  // 字体链接放在 root，所有路由共享，避免页面级组件重复声明资源。
  return [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com"
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous"
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
    }
  ];
};

export function Layout({
  children
}: { children: ReactNode }): ReactElement {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1" />

        <Meta />
        <Links />
      </head>

      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App(): ReactElement {
  return (

    // 主题状态跨登录页和工作台共享，放在 root 可以避免路由切换时丢失。
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}

export function ErrorBoundary({
  error
}: Route.ErrorBoundaryProps): ReactElement {
  let message = "Oops!";

  let details = "An unexpected error occurred.";

  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {

    // React Router 抛出的响应错误单独处理，404 需要给用户更明确的提示。
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    const {
      stack: errorStack
    } = error;

    details = error.message;
    stack = errorStack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>
        {message}
      </h1>

      <p>
        {details}
      </p>

      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>
            {stack}
          </code>
        </pre>
      )}
    </main>
  );
}
