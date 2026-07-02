import type {
  IDataMessage
} from "../shared/type";

export interface IParamsMessageSearch {
  conversationId?: number;
  limit?: number;
  q: string;
}

export type IDataMessageSearch = IDataMessage[];
