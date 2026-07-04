import type {
  IDataLogin
} from "../data-login/type";

export interface IParamsExternalLogin {
  ["access_token"]: string;
  provider: string;
}

export type IDataExternalLogin = IDataLogin;
