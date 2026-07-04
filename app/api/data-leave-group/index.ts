import {
  apiClient
} from "~/request";

import type {
  IDataLeaveGroup,
  IParamsLeaveGroup
} from "./type";

function dataLeaveGroup(params: IParamsLeaveGroup): Promise<IDataLeaveGroup> {
  return apiClient.post<IDataLeaveGroup, IParamsLeaveGroup>("/api/conversations/leave", params);
}

export { dataLeaveGroup };
export type {
  IDataLeaveGroup,
  IParamsLeaveGroup
} from "./type";
