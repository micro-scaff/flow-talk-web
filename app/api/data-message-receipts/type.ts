import type {
  IDataMessageReceipt
} from "../shared/type";

export interface IParamsMessageReceipts {
  ["message_id"]: number;
}

export type IDataMessageReceipts = IDataMessageReceipt[];
