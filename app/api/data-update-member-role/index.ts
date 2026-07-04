import {
  apiClient
} from "~/request";

import type {
  IDataUpdateMemberRole,
  IParamsUpdateMemberRole
} from "./type";

function dataUpdateMemberRole(params: IParamsUpdateMemberRole): Promise<IDataUpdateMemberRole> {
  return apiClient.request<IDataUpdateMemberRole>("/api/conversations/members/role", {
    data: params,
    method: "PATCH"
  });
}

export { dataUpdateMemberRole };
export type {
  IDataUpdateMemberRole,
  IParamsUpdateMemberRole
} from "./type";
