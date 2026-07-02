import {
  apiClient
} from "~/request";

import type {
  IDataAddGroupMembers,
  IParamsAddGroupMembers
} from "./type";

function dataAddGroupMembers(params: IParamsAddGroupMembers): Promise<IDataAddGroupMembers> {
  const {
    conversationId,
    ...payload
  } = params;

  return apiClient.post<IDataAddGroupMembers, Omit<IParamsAddGroupMembers, "conversationId">>(`/api/conversations/${conversationId}/members`, payload);
}

export { dataAddGroupMembers };
export type {
  IDataAddGroupMembers,
  IParamsAddGroupMembers
} from "./type";
