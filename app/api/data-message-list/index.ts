import {
  apiClient
} from "~/request";

import type {
  IDataMessageList,
  IParamsMessageList
} from "./type";

function dataMessageList(params: IParamsMessageList): Promise<IDataMessageList> {
  return apiClient.post<IDataMessageList, IParamsMessageList>("/api/conversations/messages/list", params);
}

export { dataMessageList };
export type {
  IDataMessageList,
  IParamsMessageList
} from "./type";
