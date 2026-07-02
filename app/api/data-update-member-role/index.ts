import {
  apiClient
} from "~/request";

import type {
  IDataUpdateMemberRole,
  IParamsUpdateMemberRole
} from "./type";

function dataUpdateMemberRole(params: IParamsUpdateMemberRole): Promise<IDataUpdateMemberRole> {
  const {
    conversationId,
    userId,
    role
  } = params;

  return apiClient.request<IDataUpdateMemberRole>(`/api/conversations/${conversationId}/members/${userId}/role`, {
    data: {
      role
    },
    method: "PATCH"
  });
}

export { dataUpdateMemberRole };
export type {
  IDataUpdateMemberRole,
  IParamsUpdateMemberRole
} from "./type";
