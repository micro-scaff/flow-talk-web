import {
  useState
} from "react";

import type {
  IAuthResponse
} from "~/api";
import {
  getSession
} from "~/utils";

interface ILoginSessionHook {
  authResult: IAuthResponse | null;
  displayName: string;
  setAuthResult: (authResult: IAuthResponse | null) => void;
}

export function useLoginSessionHook(): ILoginSessionHook {
  const [
    authResult,
    setAuthResult
  ] = useState<IAuthResponse | null>(() => {

    // 初始登录态来自本地会话，避免登录成功刷新后卡片状态丢失。
    return getSession();
  });

  const displayName = authResult?.user?.nickname
    || authResult?.user?.username
    || "Flow Talk 用户";

  return {
    authResult,
    displayName,
    setAuthResult
  };
}
