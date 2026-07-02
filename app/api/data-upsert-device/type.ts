import type {
  IDataDevice
} from "../shared/type";

export interface IParamsUpsertDevice {
  ["device_id"]: string;
  platform: string;
  ["push_token"]?: string;
}

export type IDataUpsertDevice = IDataDevice;
