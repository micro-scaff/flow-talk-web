import type {
  IDataConversationMember,
  TConversationMemberRole
} from "../shared/type";

export interface IParamsUpdateMemberRole {
  conversationId: number;
  role: TConversationMemberRole | string;
  userId: number;
}

export type IDataUpdateMemberRole = IDataConversationMember;
