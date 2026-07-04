import type {
  IDataPresence
} from "../shared/type";

export interface IParamsPresence {
  ["user_id"]: number;
}

export interface IParamsBatchPresence {
  ["user_ids"]: number[];
}

export type IDataPresenceDetail = IDataPresence;

export type IDataBatchPresence = IDataPresence[];
