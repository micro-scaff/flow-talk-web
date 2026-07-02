import {
  apiClient
} from "~/request";

import type {
  IDataMarkConversationRead,
  IParamsMarkConversationRead
} from "./type";

function dataMarkConversationRead(params: IParamsMarkConversationRead): Promise<IDataMarkConversationRead> {
  const {
    conversationId,
    ...payload
  } = params;

  return apiClient.post<IDataMarkConversationRead, Omit<IParamsMarkConversationRead, "conversationId">>(`/api/conversations/${conversationId}/read`, payload);
}

export { dataMarkConversationRead };
export type {
  IDataMarkConversationRead,
  IParamsMarkConversationRead
} from "./type";
