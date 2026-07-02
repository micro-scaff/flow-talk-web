interface IParamsLogin {
  username: string;
  password: string;
}

interface IDataLoginUser {
  ["auth_source"]?: string;
  ["avatar_url"]?: string;
  ["external_id"]?: string;
  id?: number;
  nickname?: string;
  status?: number;
  username?: string;
}

interface IDataLogin {
  token?: string;
  user?: IDataLoginUser;
}

interface IAuthSession extends IDataLogin {
  signedAt: string;
}

export type {
  IAuthSession,
  IDataLogin,
  IDataLoginUser,
  IParamsLogin
};
