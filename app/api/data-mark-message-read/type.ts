import type {
  IDataEmpty
} from "../shared/type";

export interface IParamsMarkMessageRead {
  ["message_id"]: number;
}

export type IDataMarkMessageRead = IDataEmpty | null;
