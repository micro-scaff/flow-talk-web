import type {
  IDataConversation
} from "../shared/type";

export interface IParamsUpdateGroupProfile {
  ["avatar_url"]?: string;
  conversationId: number;
  title?: string;
}

export type IDataUpdateGroupProfile = IDataConversation;
