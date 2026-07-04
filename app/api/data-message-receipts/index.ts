import {
  apiClient
} from "~/request";

import type {
  IDataMessageReceipts,
  IParamsMessageReceipts
} from "./type";

function dataMessageReceipts(params: IParamsMessageReceipts): Promise<IDataMessageReceipts> {
  return apiClient.post<IDataMessageReceipts, IParamsMessageReceipts>("/api/messages/receipts", params);
}

export { dataMessageReceipts };
export type {
  IDataMessageReceipts,
  IParamsMessageReceipts
} from "./type";
