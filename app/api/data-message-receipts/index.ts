import {
  apiClient
} from "~/request";

import type {
  IDataMessageReceipts,
  IParamsMessageReceipts
} from "./type";

function dataMessageReceipts(params: IParamsMessageReceipts): Promise<IDataMessageReceipts> {
  return apiClient.get<IDataMessageReceipts>(`/api/messages/${params.messageId}/receipts`);
}

export { dataMessageReceipts };
export type {
  IDataMessageReceipts,
  IParamsMessageReceipts
} from "./type";
