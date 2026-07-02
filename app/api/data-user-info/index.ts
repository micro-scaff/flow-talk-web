import {
  apiClient
} from "~/request";

import type {
  TUserInfoResponse
} from "./type";

function getCurrentUser(): Promise<TUserInfoResponse> {
  return apiClient.get<TUserInfoResponse>("/api/me");
}

export { getCurrentUser };
export type { TUserInfoResponse } from "./type";
