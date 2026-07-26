import {
  apiClient
} from "~/request";

import type {
  IDataMarkMessageUnread,
  IParamsMarkMessageUnread
} from "./type";

function dataMarkMessageUnread(params: IParamsMarkMessageUnread): Promise<IDataMarkMessageUnread> {
  return apiClient.post<IDataMarkMessageUnread, IParamsMarkMessageUnread>("/api/messages/unread", params);
}

export { dataMarkMessageUnread };
export type {
  IDataMarkMessageUnread,
  IParamsMarkMessageUnread
} from "./type";
