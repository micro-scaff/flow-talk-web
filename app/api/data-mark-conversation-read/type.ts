import type {
  IDataReadState
} from "../shared/type";

export interface IParamsMarkConversationRead {
  ["conversation_id"]: number;
  ["last_read_message_id"]: number;
}

export type IDataMarkConversationRead = IDataReadState;
