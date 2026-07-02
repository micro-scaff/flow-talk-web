import {
  apiClient
} from "~/request";

import type {
  IDataLeaveGroup,
  IParamsLeaveGroup
} from "./type";

function dataLeaveGroup(params: IParamsLeaveGroup): Promise<IDataLeaveGroup> {
  return apiClient.post<IDataLeaveGroup, Record<string, never>>(`/api/conversations/${params.conversationId}/leave`, {});
}

export { dataLeaveGroup };
export type {
  IDataLeaveGroup,
  IParamsLeaveGroup
} from "./type";
