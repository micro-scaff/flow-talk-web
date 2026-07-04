import {
  apiClient
} from "~/request";

import type {
  IDataMarkMessageRead,
  IParamsMarkMessageRead
} from "./type";

function dataMarkMessageRead(params: IParamsMarkMessageRead): Promise<IDataMarkMessageRead> {
  return apiClient.post<IDataMarkMessageRead, IParamsMarkMessageRead>("/api/messages/read", params);
}

export { dataMarkMessageRead };
export type {
  IDataMarkMessageRead,
  IParamsMarkMessageRead
} from "./type";
