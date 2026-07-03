import type {
  IDataMessagePage
} from "../shared/type";

export interface IParamsMessageList {
  ["before_id"]?: number;
  conversationId: number;
  limit?: number;
}

export type IDataMessageList = IDataMessagePage;
