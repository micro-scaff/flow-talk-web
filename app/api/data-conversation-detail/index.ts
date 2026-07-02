import {
  apiClient
} from "~/request";

import type {
  IDataConversationDetail,
  IParamsConversationDetail
} from "./type";

function dataConversationDetail(params: IParamsConversationDetail): Promise<IDataConversationDetail> {
  return apiClient.get<IDataConversationDetail>(`/api/conversations/${params.conversationId}`);
}

export { dataConversationDetail };
export type {
  IDataConversationDetail,
  IParamsConversationDetail
} from "./type";
