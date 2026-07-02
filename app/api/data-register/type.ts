import type {
  IParamsLogin
} from "../data-login/type";

interface IParamsRegister extends IParamsLogin {
  avatarUrl?: string;
  nickname?: string;
}

interface IParamsRegisterApi extends IParamsLogin {
  ["avatar_url"]?: string;
  nickname?: string;
}

export type {
  IParamsRegister,
  IParamsRegisterApi
};
export type { IDataLogin as IDataRegister } from "../data-login/type";
