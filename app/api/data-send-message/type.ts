import type {
  IDataMessage,
  IDataMessageContent,
  TMessageType
} from "../shared/type";

export interface IParamsSendMessage {
  ["client_msg_id"]: string;
  content: IDataMessageContent;
  conversationId: number;
  ["message_type"]: TMessageType;
}

export type IDataSendMessage = IDataMessage;
