import {
  apiClient
} from "~/request";

import type {
  IDataMarkMessageRead,
  IParamsMarkMessageRead
} from "./type";

function dataMarkMessageRead(params: IParamsMarkMessageRead): Promise<IDataMarkMessageRead> {
  return apiClient.post<IDataMarkMessageRead, Record<string, never>>(`/api/messages/${params.messageId}/read`, {});
}

export { dataMarkMessageRead };
export type {
  IDataMarkMessageRead,
  IParamsMarkMessageRead
} from "./type";
