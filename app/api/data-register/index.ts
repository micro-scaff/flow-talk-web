import {
  apiClient
} from "~/request";

import type {
  IDataRegister,
  IParamsRegister,
  IParamsRegisterApi
} from "./type";

function dataRegister(payload: IParamsRegister): Promise<IDataRegister> {

  // 页面表单使用 camelCase，提交给后端时映射为 OpenAPI 中定义的 avatar_base64。
  const apiPayload: IParamsRegisterApi = {
    "avatar_base64": payload.avatarBase64,
    nickname: payload.nickname,
    password: payload.password,
    username: payload.username
  };

  return apiClient.post<IDataRegister, IParamsRegisterApi>("/api/auth/register", apiPayload);
}

export { dataRegister };

export type {
  IDataRegister,
  IParamsRegister,
  IParamsRegisterApi
} from "./type";
