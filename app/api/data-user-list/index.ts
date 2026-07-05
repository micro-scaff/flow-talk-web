import {
  apiClient
} from "~/request";

import type {
  IDataListUsers,
  IParamsListUsers
} from "./type";

const DEFAULT_LIST_USERS_PARAMS: IParamsListUsers = {

  // 聊天首页需要完整通讯录，所以默认走 all=true；搜索/分页场景可显式传入其它参数。
  all: true
};

function dataListUsers(params: IParamsListUsers = DEFAULT_LIST_USERS_PARAMS): Promise<IDataListUsers> {
  return apiClient.get<IDataListUsers>("/api/users", {
    params
  });
}

export { dataListUsers };
export type {
  IDataListUsers,
  IParamsListUsers
} from "./type";
