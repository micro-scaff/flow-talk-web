import type {
  IParamsLogin
} from "../data-login/type";

export interface IParamsRegister extends IParamsLogin {
  avatarBase64?: string;
  nickname?: string;
}

export interface IParamsRegisterApi extends IParamsLogin {
  ["avatar_base64"]?: string;
  nickname?: string;
}

export type { IDataLogin as IDataRegister } from "../data-login/type";
