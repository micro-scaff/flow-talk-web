import {
  apiClient
} from "~/request";

import type {
  IDataMessageSearch,
  IParamsMessageSearch
} from "./type";

function dataMessageSearch(params: IParamsMessageSearch): Promise<IDataMessageSearch> {
  const {
    conversationId,
    ...query
  } = params;

  if (conversationId) {
    return apiClient.get<IDataMessageSearch, Omit<IParamsMessageSearch, "conversationId">>(`/api/conversations/${conversationId}/messages/search`, query);
  }

  return apiClient.get<IDataMessageSearch, Omit<IParamsMessageSearch, "conversationId">>("/api/messages/search", query);
}

export { dataMessageSearch };
export type {
  IDataMessageSearch,
  IParamsMessageSearch
} from "./type";
