import {
  apiClient
} from "~/request";

import type {
  IDataLogin,
  IParamsLogin
} from "./type";

function dataLogin(payload: IParamsLogin): Promise<IDataLogin> {
  return apiClient.post<IDataLogin, IParamsLogin>("/api/auth/login", payload);
}

export type {
  IAuthSession,
  IDataLogin,
  IDataLoginUser,
  IParamsLogin
} from "./type";

export { dataLogin };
