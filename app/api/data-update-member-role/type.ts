import type {
  IDataConversationMember,
  TConversationMemberRole
} from "../shared/type";

export interface IParamsUpdateMemberRole {
  ["conversation_id"]: number;
  role: TConversationMemberRole | string;
  ["user_id"]: number;
}

export type IDataUpdateMemberRole = IDataConversationMember;
