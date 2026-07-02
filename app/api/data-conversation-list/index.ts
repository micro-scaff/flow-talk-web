import {
  apiClient
} from "~/request";

import type {
  IDataConversationList
} from "./type";

function dataConversationList(): Promise<IDataConversationList> {
  return apiClient.get<IDataConversationList>("/api/conversations");
}

export { dataConversationList };
export type { IDataConversationList } from "./type";
