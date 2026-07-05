import type {
  IDataLoginUser
} from "../data-login/type";

export interface IParamsListUsers {

  // all=true 用于通讯录初始化读取全部用户；不传时后端按 limit/offset 分页。
  all?: boolean;
  ["auth_source"]?: "external" | "local";
  keyword?: string;
  limit?: number;
  offset?: number;
  status?: 0 | 1;
}

export interface IDataListUsers extends Array<IDataLoginUser> {
  length: number;
}
