import {
  apiClient
} from "~/request";

import type {
  IDataMessageSearch,
  IParamsMessageSearch
} from "./type";

function dataMessageSearch(params: IParamsMessageSearch): Promise<IDataMessageSearch> {
  const {
    conversation_id: conversationId
  } = params;

  if (conversationId) {
    return apiClient.post<IDataMessageSearch, IParamsMessageSearch>("/api/conversations/messages/search", params);
  }

  return apiClient.post<IDataMessageSearch, Omit<IParamsMessageSearch, "conversation_id">>("/api/messages/search", {
    keyword: params.keyword,
    limit: params.limit
  });
}

export { dataMessageSearch };
export type {
  IDataMessageSearch,
  IParamsMessageSearch
} from "./type";
