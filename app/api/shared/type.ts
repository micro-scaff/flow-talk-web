export type TConversationType = "direct" | "group";

export type TConversationMemberRole = "owner" | "admin" | "member";

export type TConversationMemberStatus = "active" | "removed" | "left";

export type TMessageType = "text" | "image" | "video" | "file" | string;

export type TMessageStatus = "sending" | "sent" | "delivered" | "read" | "recalled" | "deleted" | string;

export interface IDataUser {
  ["auth_source"]?: string;
  ["avatar_url"]?: string;
  ["external_id"]?: string;
  id?: number;
  nickname?: string;
  status?: number;
  username?: string;
}

export interface IDataConversationMember {
  ["user_id"]: number;
  role: TConversationMemberRole | string;
  status: TConversationMemberStatus | string;
}

export interface IDataMessageContent {
  text?: string;
  url?: string;
  name?: string;
  size?: number;
  [key: string]: unknown;
}

export interface IDataMessage {
  ["client_msg_id"]?: string;
  ["conversation_id"]: number;
  content?: IDataMessageContent;
  id: number;
  ["message_type"]?: TMessageType;
  ["sender_id"]: number;
  ["sent_at"]?: string;
  status?: TMessageStatus;
}

export interface IDataConversation {
  ["avatar_url"]?: string;
  ["direct_key"]?: string;
  id: number;
  ["last_message_at"]?: string;
  ["last_message_id"]?: number;
  ["member_count"]?: number;
  members?: IDataConversationMember[];
  ["owner_id"]?: number;
  title?: string;
  type: TConversationType | string;
}

export interface IDataConversationListItem extends IDataConversation {
  ["last_message"]?: IDataMessage;
  ["unread_count"]?: number;
}

export interface IDataMessagePage {
  ["has_more"]: boolean;
  items: IDataMessage[];
  ["next_before_id"]?: number;
}

export interface IDataReadState {
  ["conversation_id"]: number;
  ["last_read_at"]?: string;
  ["last_read_message_id"]?: number;
}

export interface IDataDevice {
  data?: Record<string, unknown>;
  ["device_id"]?: string;
  id: number;
  ["last_seen_at"]?: string;
  platform?: string;
  ["push_token"]?: string;
  ["updated_at"]?: string;
  ["user_id"]: number;
}

export interface IDataPresence {
  ["connection_count"]?: number;
  ["last_active_at"]?: string;
  ["last_seen_at"]?: string;
  online: boolean;
  ["user_id"]: number;
}

export interface IDataMessageReceipt {
  ["message_id"]: number;
  status: string;
  ["updated_at"]?: string;
  ["user_id"]: number;
}

export interface IDataResource {
  type: "image" | "video" | string;
  url: string;
}

export interface IDataEmpty {
  success?: boolean;
}
