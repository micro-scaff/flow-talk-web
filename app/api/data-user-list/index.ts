import {
  apiClient
} from "~/request";

import type {
  IDataListUsers
} from "./type";

function dataListUsers(): Promise<IDataListUsers> {
  return apiClient.get<IDataListUsers>("/admin/users");
}

export { dataListUsers };
export type { IDataListUsers } from "./type";
