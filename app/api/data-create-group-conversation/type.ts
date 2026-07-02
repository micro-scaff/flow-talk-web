import type {
  IDataConversation
} from "../shared/type";

export interface IParamsCreateGroupConversation {
  ["avatar_url"]?: string;
  ["member_ids"]?: number[];
  title: string;
}

export type IDataCreateGroupConversation = IDataConversation;
