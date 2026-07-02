import type {
  IDataReadState
} from "../shared/type";

export interface IParamsMarkConversationRead {
  conversationId: number;
  ["last_read_message_id"]: number;
}

export type IDataMarkConversationRead = IDataReadState;
