import type {
  IDataConversation
} from "../shared/type";

export interface IParamsUpdateGroupProfile {
  ["avatar_url"]?: string;
  ["conversation_id"]: number;
  title: string;
}

export type IDataUpdateGroupProfile = IDataConversation;
