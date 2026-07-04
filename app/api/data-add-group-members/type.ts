import type {
  IDataConversationMember
} from "../shared/type";

export interface IParamsAddGroupMembers {
  ["conversation_id"]: number;
  ["user_ids"]: number[];
}

export type IDataAddGroupMembers = IDataConversationMember[];
