import {
  apiClient
} from "~/request";

import type {
  IDataBatchPresence,
  IDataPresenceDetail,
  IParamsBatchPresence,
  IParamsPresence
} from "./type";

function dataPresence(params: IParamsPresence): Promise<IDataPresenceDetail> {
  return apiClient.get<IDataPresenceDetail>(`/api/users/${params.userId}/presence`);
}

function dataBatchPresence(params: IParamsBatchPresence): Promise<IDataBatchPresence> {
  return apiClient.post<IDataBatchPresence, IParamsBatchPresence>("/api/users/presence/batch", params);
}

export {
  dataBatchPresence,
  dataPresence
};
export type {
  IDataBatchPresence,
  IDataPresenceDetail,
  IParamsBatchPresence,
  IParamsPresence
} from "./type";
