import type {
  IDataLoginUser
} from "../data-login/type";

interface IDataListUsers extends Array<IDataLoginUser> {
  length: number;
}

export type { IDataListUsers };
