import {
  apiClient
} from "~/request";

import type {
  IDataDeleteDevice
} from "./type";

function dataDeleteDevice(): Promise<IDataDeleteDevice> {
  return apiClient.delete<IDataDeleteDevice>("/api/devices");
}

export { dataDeleteDevice };
export type { IDataDeleteDevice } from "./type";
