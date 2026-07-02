import {
  authTokenStorage
} from "~/request";
import type {
  IDataLogin,
  IAuthSession
} from "~/api";

const AUTH_SESSION_KEY = "flow-talk-auth-session";

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
    window.localStorage.removeItem(AUTH_SESSION_KEY);

    return null;
  }
}

function saveSession(response: IDataLogin): void {
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
