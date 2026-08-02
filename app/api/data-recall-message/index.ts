import {
  apiClient
} from "~/request";

import type {
  IParamsRecallMessage,
  TDataRecallMessage
} from "./type";

function dataRecallMessage(params: IParamsRecallMessage): Promise<TDataRecallMessage> {
  return apiClient.post<TDataRecallMessage, IParamsRecallMessage>("/api/messages/recall", params);
}

export { dataRecallMessage };
export type {
  IParamsRecallMessage,
  TDataRecallMessage
} from "./type";
