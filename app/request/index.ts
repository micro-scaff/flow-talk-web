import {
  message
} from "antd";

import RequestClient, {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  formatToken
} from "@mt-kit/request-axios";
import type {
  RequestClientOptions
} from "@mt-kit/request-axios";

const LOCAL_API_BASE_URL = "http://127.0.0.1:8080";

const API_ENV = import.meta.env.VITE_API_ENV;

function resolveApiBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (API_ENV === "production" && typeof window !== "undefined") {
    return window.location.origin;
  }

  return LOCAL_API_BASE_URL;
}

const API_BASE_URL = resolveApiBaseUrl();

// token 单独存一份，方便请求拦截器在不解析完整会话对象的情况下快速读取。
const AUTH_TOKEN_KEY = "flow-talk-token";

// session key 需要与 utils/auth-session 保持一致，401 时请求层会直接清空完整登录态。
const AUTH_SESSION_KEY = "flow-talk-auth-session";

const authTokenStorage = {
  key: AUTH_TOKEN_KEY,
  get() {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  },
  remove() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },
  set(token: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  }
};

function clearAuthState(): void {
  authTokenStorage.remove();

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

function redirectToLogin(): void {
  if (typeof window === "undefined") {
    return;
  }

  const {
    location
  } = window;

  if (location.pathname === "/login") {
    return;
  }

  location.replace("/login");
}

// @mt-kit/request-axios 可能抛业务响应体，也可能抛 Axios error；这里统一抽取后端 message。
function pickResponseErrorMessage(errorMessage: string, error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const responseData = error.data as {
      error?: string;
      message?: string;
    };

    return responseData.error || responseData.message || errorMessage;
  }

  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response as {
      data?: {
        error?: string;
        message?: string;
      };
    };

    return response.data?.error || response.data?.message || errorMessage;
  }

  return errorMessage || "请求失败，请稍后再试";
}

function createRequestClient(baseUrl: string, options?: RequestClientOptions): RequestClient {

  // 业务接口统一返回 { code, data, message }，responseReturn: "data" 让调用方只拿 data 字段。
  const client = new RequestClient({
    paramsSerializer: "brackets",
    responseReturn: "data",
    timeout: 10_000,
    ...options,
    baseURL: baseUrl
  });

  async function doReAuthenticate(): Promise<void> {

    // 后端 401 代表 token 失效或未登录，直接退出到登录页，不走 refresh token。
    clearAuthState();
    redirectToLogin();
  }

  async function doRefreshToken(): Promise<string> {
    return authTokenStorage.get() || "";
  }

  client.addRequestInterceptor({
    fulfilled: async config => {

      // 请求模块会被 SSR 导入，读取 localStorage 前必须确认当前在浏览器。
      if (typeof window === "undefined") {
        return config;
      }

      const token = authTokenStorage.get();

      if (token) {
        config.headers.Authorization = formatToken(token);
      }

      return config;
    }
  });

  client.addResponseInterceptor(defaultResponseInterceptor({
    code: code => {
      return code === 200;
    }
  }));

  // 当前后端没有 refresh token 接口；保留认证拦截器只负责统一处理 401。
  client.addResponseInterceptor(authenticateResponseInterceptor({
    client,
    doReAuthenticate,
    doRefreshToken,
    enableRefreshToken: false,
    formatToken,
    options: {
      code: 401
    }
  }));

  client.addResponseInterceptor(errorMessageResponseInterceptor({
    client,
    errorFn(errorMessage, error) {
      message.error(pickResponseErrorMessage(errorMessage, error));
    }
  }));

  return client;
}

const apiClient = createRequestClient(API_BASE_URL);

// 不带业务响应解析的原始 client，预留给 favicon、静态探测等非标准响应场景。
const baseRequestClient = new RequestClient({
  baseURL: API_BASE_URL
});

export {
  API_BASE_URL,
  apiClient,
  authTokenStorage,
  baseRequestClient,
  createRequestClient
};
