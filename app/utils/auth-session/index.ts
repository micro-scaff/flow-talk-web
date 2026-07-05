import {
  authTokenStorage
} from "~/request";
import type {
  IDataLogin,
  IAuthSession
} from "~/api";

const AUTH_SESSION_KEY = "flow-talk-auth-session";

// React Router clientLoader 和页面 hook 都会读取会话；SSR 导入时必须避开 window。
function getSession(): IAuthSession | null {
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

    // 本地存储被手动编辑或旧版本格式不兼容时，清掉脏数据让登录流重新开始。
    window.localStorage.removeItem(AUTH_SESSION_KEY);

    return null;
  }
}

function saveSession(response: IDataLogin): void {
  if (!response.token) {
    return;
  }

  // signedAt 是前端补充字段，用于以后扩展“上次登录时间”或本地过期策略。
  const session: IAuthSession = {
    ...response,
    signedAt: new Date().toISOString()
  };

  authTokenStorage.set(response.token);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }
}

function clearSession(): void {
  authTokenStorage.remove();

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  }
}

export {
  clearSession,
  getSession,
  saveSession
};
