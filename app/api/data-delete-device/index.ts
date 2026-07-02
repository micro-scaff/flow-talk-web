import {
  apiClient
} from "~/request";

import type {
  IDataDeleteDevice,
  IParamsDeleteDevice
} from "./type";

function dataDeleteDevice(params: IParamsDeleteDevice): Promise<IDataDeleteDevice> {
  return apiClient.delete<IDataDeleteDevice>(`/api/devices/${params.deviceId}`);
}

export { dataDeleteDevice };
export type {
  IDataDeleteDevice,
  IParamsDeleteDevice
} from "./type";
