export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IRegisterFormValues extends ILoginRequest {
  avatarUrl?: string;
  nickname?: string;
}

export interface IRegisterApiRequest extends ILoginRequest {
  ["avatar_url"]?: string;
  nickname?: string;
}

export interface IAuthUser {
  ["auth_source"]?: string;
  ["avatar_url"]?: string;
  ["external_id"]?: string;
  id?: number;
  nickname?: string;
  status?: number;
  username?: string;
}

export interface IAuthResponse {
  token?: string;
  user?: IAuthUser;
}

export interface IApiErrorResponse {
  error?: string;
  message?: string;
}

export interface IAuthSession extends IAuthResponse {
  signedAt: string;
}
