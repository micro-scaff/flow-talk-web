import type {
  IDataEmpty
} from "../shared/type";

export interface IParamsMarkMessageDelivered {
  messageId: number;
}

export type IDataMarkMessageDelivered = IDataEmpty | null;
