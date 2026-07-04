import type {
  IDataMessage,
  IDataMessageContent,
  TMessageType
} from "../shared/type";

export interface IParamsSendMessage {
  ["client_msg_id"]: string;
  content: IDataMessageContent;
  ["conversation_id"]: number;
  ["message_type"]: TMessageType;
}

export type IDataSendMessage = IDataMessage;
