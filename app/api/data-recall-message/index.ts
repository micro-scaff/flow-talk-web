import {
  apiClient
} from "~/request";

import type {
  IDataRecallMessage,
  IParamsRecallMessage
} from "./type";

function dataRecallMessage(params: IParamsRecallMessage): Promise<IDataRecallMessage> {
  return apiClient.request<IDataRecallMessage>(`/api/messages/${params.messageId}/recall`, {
    data: {},
    method: "PATCH"
  });
}

export { dataRecallMessage };
export type {
  IDataRecallMessage,
  IParamsRecallMessage
} from "./type";
