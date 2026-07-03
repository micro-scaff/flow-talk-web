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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";

const AUTH_TOKEN_KEY = "flow-talk-token";

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
  const client = new RequestClient({
    paramsSerializer: "brackets",
    responseReturn: "data",
    timeout: 10_000,
    ...options,
    baseURL: baseUrl
  });

  async function doReAuthenticate(): Promise<void> {
    authTokenStorage.remove();
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
