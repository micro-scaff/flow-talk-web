import type {
  IDataLogin
} from "../data-login/type";

export interface IParamsExternalLogin {
  ["access_token"]: string;
  provider: string;
}

export interface IDataExternalLogin {
  code?: number;
  data?: IDataLogin;
  message?: string;
}
