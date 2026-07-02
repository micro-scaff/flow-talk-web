import {
  apiClient
} from "~/request";

import type {
  IDataCreateGroupConversation,
  IParamsCreateGroupConversation
} from "./type";

function dataCreateGroupConversation(params: IParamsCreateGroupConversation): Promise<IDataCreateGroupConversation> {
  return apiClient.post<IDataCreateGroupConversation, IParamsCreateGroupConversation>("/api/conversations/groups", params);
}

export { dataCreateGroupConversation };
export type {
  IDataCreateGroupConversation,
  IParamsCreateGroupConversation
} from "./type";
