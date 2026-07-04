import {
  apiClient
} from "~/request";

import type {
  IDataUpdateGroupProfile,
  IParamsUpdateGroupProfile
} from "./type";

function dataUpdateGroupProfile(params: IParamsUpdateGroupProfile): Promise<IDataUpdateGroupProfile> {
  return apiClient.request<IDataUpdateGroupProfile>("/api/conversations/profile", {
    data: params,
    method: "PATCH"
  });
}

export { dataUpdateGroupProfile };
export type {
  IDataUpdateGroupProfile,
  IParamsUpdateGroupProfile
} from "./type";
