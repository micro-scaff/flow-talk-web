export interface IParamsLogin {
  username: string;
  password: string;
}

export interface IDataLoginUser {
  ["auth_source"]?: string;
  ["avatar_url"]?: string;
  ["external_id"]?: string;
  id?: number;
  nickname?: string;
  status?: number;
  username?: string;
}

export interface IDataLogin {
  token?: string;
  user?: IDataLoginUser;
}

export interface IAuthSession extends IDataLogin {
  signedAt: string;
}
