import {
  apiClient
} from "~/request";

import type {
  IAuthResponse,
  ILoginRequest
} from "./type";

function login(payload: ILoginRequest): Promise<IAuthResponse> {
  return apiClient.post<IAuthResponse, ILoginRequest>("/api/auth/login", payload);
}

export type {
  IApiErrorResponse,
  IAuthResponse,
  IAuthSession,
  IAuthUser,
  ILoginRequest
} from "./type";

export { login };
