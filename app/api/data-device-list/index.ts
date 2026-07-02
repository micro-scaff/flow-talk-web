import {
  apiClient
} from "~/request";

import type {
  IDataDeviceList
} from "./type";

function dataDeviceList(): Promise<IDataDeviceList> {
  return apiClient.get<IDataDeviceList>("/api/devices");
}

export { dataDeviceList };
export type { IDataDeviceList } from "./type";
