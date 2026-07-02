import {
  apiClient
} from "~/request";

import type {
  IDataDeleteMessage,
  IParamsDeleteMessage
} from "./type";

function dataDeleteMessage(params: IParamsDeleteMessage): Promise<IDataDeleteMessage> {
  return apiClient.request<IDataDeleteMessage>(`/api/messages/${params.messageId}/delete`, {
    data: {},
    method: "PATCH"
  });
}

export { dataDeleteMessage };
export type {
  IDataDeleteMessage,
  IParamsDeleteMessage
} from "./type";
