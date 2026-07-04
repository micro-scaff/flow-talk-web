import type {
  IDataDevice
} from "../shared/type";

export interface IParamsUpsertDevice {
  data: Record<string, unknown>;
  ["user_id"]: number;
}

export type IDataUpsertDevice = IDataDevice;
