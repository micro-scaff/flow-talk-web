import {
  apiClient
} from "~/request";

import type {
  IDataUpdateGroupProfile,
  IParamsUpdateGroupProfile
} from "./type";

function dataUpdateGroupProfile(params: IParamsUpdateGroupProfile): Promise<IDataUpdateGroupProfile> {
  const {
    conversationId,
    ...payload
  } = params;

  return apiClient.request<IDataUpdateGroupProfile>(`/api/conversations/${conversationId}`, {
    data: payload,
    method: "PATCH"
  });
}

export { dataUpdateGroupProfile };
export type {
  IDataUpdateGroupProfile,
  IParamsUpdateGroupProfile
} from "./type";
