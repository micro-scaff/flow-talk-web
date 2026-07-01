import {
  axios
} from "@mt-kit/request-axios";

import type {
  IApiErrorResponse,
  IAuthResponse,
  IAuthSession,
  ILoginRequest,
  IRegisterApiRequest,
  IRegisterFormValues
} from "~/model/auth.model";
import {
  apiClient,
  authTokenStorage
} from "~/request";

const AUTH_SESSION_KEY = "flow-talk-auth-session";

function pickErrorMessage(error: unknown): string {
  if (axios.isAxiosError<IApiErrorResponse>(error)) {
    return error.response?.data?.error
      || error.response?.data?.message
      || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "请求失败，请稍后再试";
}

const authApi = {
  async login(payload: ILoginRequest): Promise<IAuthResponse> {
    return apiClient.post<IAuthResponse, ILoginRequest>("/api/auth/login", payload);
  },

  async register(payload: IRegisterFormValues): Promise<IAuthResponse> {

    // 页面表单使用 camelCase，提交给后端时映射为 OpenAPI 中定义的 avatar_url。
    const apiPayload: IRegisterApiRequest = {
      "avatar_url": payload.avatarUrl,
      nickname: payload.nickname,
      password: payload.password,
      username: payload.username
    };

    return apiClient.post<IAuthResponse, IRegisterApiRequest>("/api/auth/register", apiPayload);
  },

  getErrorMessage: pickErrorMessage,

  getSession(): IAuthSession | null {
    if (typeof window === "undefined") {
      return null;
    }

    const session = window.localStorage.getItem(AUTH_SESSION_KEY);

    if (!session) {
      return null;
    }

    try {
      return JSON.parse(session) as IAuthSession;
    } catch {
      window.localStorage.removeItem(AUTH_SESSION_KEY);

      return null;
    }
  },

  saveSession(response: IAuthResponse): void {
    if (!response.token) {
      return;
    }

    const session: IAuthSession = {
      ...response,
      signedAt: new Date().toISOString()
    };

    authTokenStorage.set(response.token);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    }
  }
};

export { authApi };
