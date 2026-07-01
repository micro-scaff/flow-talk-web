import RequestClient, {
  formatToken
} from "@mt-kit/request-axios";

const API_BASE_URL = "http://127.0.0.1:8080";

const AUTH_TOKEN_KEY = "flow-talk-token";

const apiClient = new RequestClient({
  baseURL: API_BASE_URL,
  paramsSerializer: "brackets",
  responseReturn: "body",
  timeout: 10_000
});

apiClient.addRequestInterceptor({
  fulfilled(config) {

    // 请求模块会被 SSR 导入，读取 localStorage 前必须确认当前在浏览器。
    if (typeof window === "undefined") {
      return config;
    }

    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = formatToken(token);
    }

    return config;
  }
});

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

export {
  apiClient,
  authTokenStorage
};
