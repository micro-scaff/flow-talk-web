import {
  apiClient
} from "~/request";

import type {
  IDataMarkConversationRead,
  IParamsMarkConversationRead
} from "./type";

function dataMarkConversationRead(params: IParamsMarkConversationRead): Promise<IDataMarkConversationRead> {
  return apiClient.post<IDataMarkConversationRead, IParamsMarkConversationRead>("/api/conversations/read", params);
}

export { dataMarkConversationRead };
export type {
  IDataMarkConversationRead,
  IParamsMarkConversationRead
} from "./type";
