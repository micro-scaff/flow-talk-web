import {
  apiClient
} from "~/request";

import type {
  IDataSendMessage,
  IParamsSendMessage
} from "./type";

function dataSendMessage(params: IParamsSendMessage): Promise<IDataSendMessage> {
  return apiClient.post<IDataSendMessage, IParamsSendMessage>("/api/conversations/messages", params);
}

export { dataSendMessage };
export type {
  IDataSendMessage,
  IParamsSendMessage
} from "./type";
