import {
  apiClient
} from "~/request";

import type {
  IDataAddGroupMembers,
  IParamsAddGroupMembers
} from "./type";

function dataAddGroupMembers(params: IParamsAddGroupMembers): Promise<IDataAddGroupMembers> {
  return apiClient.post<IDataAddGroupMembers, IParamsAddGroupMembers>("/api/conversations/members", params);
}

export { dataAddGroupMembers };
export type {
  IDataAddGroupMembers,
  IParamsAddGroupMembers
} from "./type";
