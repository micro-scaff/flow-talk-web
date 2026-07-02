import {
  apiClient
} from "~/request";

import type {
  IDataGetCurrentUser
} from "./type";

function dataGetCurrentUser(): Promise<IDataGetCurrentUser> {
  return apiClient.get<IDataGetCurrentUser>("/api/me");
}

export { dataGetCurrentUser };
export type { IDataGetCurrentUser } from "./type";
