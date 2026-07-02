import {
  apiClient
} from "~/request";

import type {
  IDataMarkMessageDelivered,
  IParamsMarkMessageDelivered
} from "./type";

function dataMarkMessageDelivered(params: IParamsMarkMessageDelivered): Promise<IDataMarkMessageDelivered> {
  return apiClient.post<IDataMarkMessageDelivered, Record<string, never>>(`/api/messages/${params.messageId}/delivered`, {});
}

export { dataMarkMessageDelivered };
export type {
  IDataMarkMessageDelivered,
  IParamsMarkMessageDelivered
} from "./type";
