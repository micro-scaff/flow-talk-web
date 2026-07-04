import {
  apiClient
} from "~/request";

import type {
  IDataConversationDetail,
  IParamsConversationDetail
} from "./type";

function dataConversationDetail(params: IParamsConversationDetail): Promise<IDataConversationDetail> {
  return apiClient.post<IDataConversationDetail, IParamsConversationDetail>("/api/conversations/detail", params);
}

export { dataConversationDetail };
export type {
  IDataConversationDetail,
  IParamsConversationDetail
} from "./type";
