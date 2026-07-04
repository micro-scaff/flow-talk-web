import {
  apiClient
} from "~/request";

import type {
  IDataListUsers
} from "./type";

function dataListUsers(): Promise<IDataListUsers> {
  return apiClient.get<IDataListUsers>("/api/admin/users");
}

export { dataListUsers };
export type { IDataListUsers } from "./type";
