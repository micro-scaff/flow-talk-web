import {
  apiClient
} from "~/request";

import type {
  IDataCreateDirectConversation,
  IParamsCreateDirectConversation
} from "./type";

function dataCreateDirectConversation(params: IParamsCreateDirectConversation): Promise<IDataCreateDirectConversation> {
  return apiClient.post<IDataCreateDirectConversation, IParamsCreateDirectConversation>("/api/conversations/direct", params);
}

export { dataCreateDirectConversation };
export type {
  IDataCreateDirectConversation,
  IParamsCreateDirectConversation
} from "./type";
