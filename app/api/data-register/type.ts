import type {
  IParamsLogin
} from "../data-login/type";

export interface IParamsRegister extends IParamsLogin {
  avatarUrl?: string;
  nickname?: string;
}

export interface IParamsRegisterApi extends IParamsLogin {
  ["avatar_url"]?: string;
  nickname?: string;
}

export type { IDataLogin as IDataRegister } from "../data-login/type";
