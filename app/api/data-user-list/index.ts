import {
  apiClient
} from "~/request";

import type {
  TUserListResponse
} from "./type";

function listUsers(): Promise<TUserListResponse> {
  return apiClient.get<TUserListResponse>("/admin/users");
}

export { listUsers };
export type { TUserListResponse } from "./type";
