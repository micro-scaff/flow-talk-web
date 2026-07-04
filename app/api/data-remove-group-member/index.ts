import {
  apiClient
} from "~/request";

import type {
  IDataRemoveGroupMember,
  IParamsRemoveGroupMember
} from "./type";

function dataRemoveGroupMember(params: IParamsRemoveGroupMember): Promise<IDataRemoveGroupMember> {
  return apiClient.delete<IDataRemoveGroupMember, IParamsRemoveGroupMember>("/api/conversations/members", params);
}

export { dataRemoveGroupMember };
export type {
  IDataRemoveGroupMember,
  IParamsRemoveGroupMember
} from "./type";
