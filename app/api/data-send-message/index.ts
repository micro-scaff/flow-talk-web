import {
  apiClient
} from "~/request";

import type {
  IDataSendMessage,
  IParamsSendMessage
} from "./type";

function dataSendMessage(params: IParamsSendMessage): Promise<IDataSendMessage> {
  const {
    conversationId,
    ...payload
  } = params;

  return apiClient.post<IDataSendMessage, Omit<IParamsSendMessage, "conversationId">>(`/api/conversations/${conversationId}/messages`, payload);
}

export { dataSendMessage };
export type {
  IDataSendMessage,
  IParamsSendMessage
} from "./type";
