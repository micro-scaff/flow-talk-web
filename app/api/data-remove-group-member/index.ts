import {
  apiClient
} from "~/request";

import type {
  IDataRemoveGroupMember,
  IParamsRemoveGroupMember
} from "./type";

function dataRemoveGroupMember(params: IParamsRemoveGroupMember): Promise<IDataRemoveGroupMember> {
  return apiClient.delete<IDataRemoveGroupMember>(`/api/conversations/${params.conversationId}/members/${params.userId}`);
}

export { dataRemoveGroupMember };
export type {
  IDataRemoveGroupMember,
  IParamsRemoveGroupMember
} from "./type";
