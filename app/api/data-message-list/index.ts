import {
  apiClient
} from "~/request";

import type {
  IDataMessageList,
  IParamsMessageList
} from "./type";

function dataMessageList(params: IParamsMessageList): Promise<IDataMessageList> {
  const {
    conversationId,
    ...query
  } = params;

  return apiClient.get<IDataMessageList, Omit<IParamsMessageList, "conversationId">>(`/api/conversations/${conversationId}/messages`, query);
}

export { dataMessageList };
export type {
  IDataMessageList,
  IParamsMessageList
} from "./type";
