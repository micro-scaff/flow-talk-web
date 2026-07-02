import {
  apiClient
} from "~/request";

import type {
  IDataExternalLogin,
  IParamsExternalLogin
} from "./type";

function dataExternalLogin(params: IParamsExternalLogin): Promise<IDataExternalLogin> {
  return apiClient.post<IDataExternalLogin, IParamsExternalLogin>("/api/auth/external", params);
}

export { dataExternalLogin };
export type {
  IDataExternalLogin,
  IParamsExternalLogin
} from "./type";
