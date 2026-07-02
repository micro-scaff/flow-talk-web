import type {
  IDataConversationMember
} from "../shared/type";

export interface IParamsAddGroupMembers {
  conversationId: number;
  ["user_ids"]: number[];
}

export type IDataAddGroupMembers = IDataConversationMember[];
