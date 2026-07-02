import type {
  ILoginRequest
} from "../data-login/type";

interface IRegisterFormValues extends ILoginRequest {
  avatarUrl?: string;
  nickname?: string;
}

interface IRegisterApiRequest extends ILoginRequest {
  ["avatar_url"]?: string;
  nickname?: string;
}

export type {
  IRegisterApiRequest,
  IRegisterFormValues
};
export type { IAuthResponse } from "../data-login/type";
