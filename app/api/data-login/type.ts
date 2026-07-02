interface ILoginRequest {
  username: string;
  password: string;
}

interface IAuthUser {
  ["auth_source"]?: string;
  ["avatar_url"]?: string;
  ["external_id"]?: string;
  id?: number;
  nickname?: string;
  status?: number;
  username?: string;
}

interface IAuthResponse {
  token?: string;
  user?: IAuthUser;
}

interface IApiErrorResponse {
  code?: number;
  data?: unknown;
  error?: string;
  message?: string;
}

interface IAuthSession extends IAuthResponse {
  signedAt: string;
}

export type {
  IApiErrorResponse,
  IAuthResponse,
  IAuthSession,
  IAuthUser,
  ILoginRequest
};
