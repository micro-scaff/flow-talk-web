import {
  apiClient
} from "~/request";

import type {
  IAuthResponse,
  IRegisterApiRequest,
  IRegisterFormValues
} from "./type";

function register(payload: IRegisterFormValues): Promise<IAuthResponse> {

  // 页面表单使用 camelCase，提交给后端时映射为 OpenAPI 中定义的 avatar_url。
  const apiPayload: IRegisterApiRequest = {
    "avatar_url": payload.avatarUrl,
    nickname: payload.nickname,
    password: payload.password,
    username: payload.username
  };

  return apiClient.post<IAuthResponse, IRegisterApiRequest>("/api/auth/register", apiPayload);
}

export { register };

export type {
  IRegisterApiRequest,
  IRegisterFormValues
} from "./type";
