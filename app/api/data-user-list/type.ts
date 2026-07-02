import type {
  IDataLoginUser
} from "../data-login/type";

export interface IDataListUsers extends Array<IDataLoginUser> {
  length: number;
}
