import {
  apiClient
} from "~/request";

import type {
  IDataUpsertDevice,
  IParamsUpsertDevice
} from "./type";

function dataUpsertDevice(params: IParamsUpsertDevice): Promise<IDataUpsertDevice> {
  return apiClient.post<IDataUpsertDevice, IParamsUpsertDevice>("/api/devices", params);
}

export { dataUpsertDevice };
export type {
  IDataUpsertDevice,
  IParamsUpsertDevice
} from "./type";
