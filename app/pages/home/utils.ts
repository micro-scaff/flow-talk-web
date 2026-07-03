import type {
  IDataConversation,
  IDataConversationListItem,
  IDataGetCurrentUser,
  IDataMessage
} from "~/api";

interface ICreateLocalMessageParams {
  clientMsgId: string;
  content: IDataMessage["content"];
  conversationId: number;
  messageType: IDataMessage["message_type"];
  senderId: number;
}

interface IUpdateConversationSummaryOptions {
  activeConversationId: null | number;
  currentUserId?: null | number;
}

type TNamedUser = Pick<IDataGetCurrentUser, "id" | "nickname" | "username">;

function createLocalMessageId(): number {
  return -(Date.now() + Math.floor(Math.random() * 1000));
}

function getUserName(user?: null | TNamedUser): string {
  return user?.nickname || user?.username || (user?.id ? `用户 ${user.id}` : "未命名用户");
}

function getConversationTitle(conversation?: IDataConversation | IDataConversationListItem | null): string {
  if (!conversation) {
    return "选择一个会话";
  }

  return conversation.title || (conversation.type === "direct" ? "单聊会话" : "群聊会话");
}

function formatDateTime(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit"
  });
}

function readMessageText(messageItem?: IDataMessage): string {
  if (!messageItem?.content) {
    return "[空消息]";
  }

  if (typeof messageItem.content.text === "string") {
    return messageItem.content.text;
  }

  if (typeof messageItem.content.url === "string") {
    return messageItem.content.url;
  }

  return JSON.stringify(messageItem.content);
}

function pickWsMessage(payload: unknown): IDataMessage | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("id" in payload && "conversation_id" in payload) {
    return payload as IDataMessage;
  }

  if ("message" in payload) {
    const eventPayload = payload as {
      message?: IDataMessage;
    };

    return eventPayload.message || null;
  }

  return null;
}

function createLocalSendingMessage(params: ICreateLocalMessageParams): IDataMessage {
  const {
    clientMsgId,
    content,
    conversationId,
    messageType,
    senderId
  } = params;

  const message: IDataMessage = {
    client_msg_id: clientMsgId,
    content,
    conversation_id: conversationId,
    id: createLocalMessageId(),
    message_type: messageType,
    sender_id: senderId,
    sent_at: new Date().toISOString(),
    status: "sending"
  };

  return message;
}

function isSameMessage(source: IDataMessage, target: IDataMessage): boolean {
  if (source.id === target.id && source.id > 0) {
    return true;
  }

  return Boolean(source.client_msg_id && target.client_msg_id && source.client_msg_id === target.client_msg_id);
}

function hasMessage(currentMessages: IDataMessage[], nextMessage: IDataMessage): boolean {
  return currentMessages.some(item => {
    return isSameMessage(item, nextMessage);
  });
}

function mergeMessage(currentMessages: IDataMessage[], nextMessage: IDataMessage): IDataMessage[] {
  const messageIndex = currentMessages.findIndex(item => {
    return isSameMessage(item, nextMessage);
  });

  if (messageIndex === -1) {
    return [
      ...currentMessages,
      nextMessage
    ];
  }

  return currentMessages.map((item, index) => {
    return index === messageIndex ? nextMessage : item;
  });
}

function updateConversationSummary(
    currentConversations: IDataConversationListItem[],
    messageItem: IDataMessage,
    options: IUpdateConversationSummaryOptions
): IDataConversationListItem[] {
  return currentConversations.map(conversation => {
    if (conversation.id !== messageItem.conversation_id) {
      return conversation;
    }

    const shouldIncreaseUnread = messageItem.conversation_id !== options.activeConversationId && messageItem.sender_id !== options.currentUserId;

    return {
      ...conversation,
      last_message: messageItem,
      last_message_at: messageItem.sent_at || conversation.last_message_at,
      last_message_id: messageItem.id,
      unread_count: (conversation.unread_count || 0) + (shouldIncreaseUnread ? 1 : 0)
    };
  });
}

function shouldRefreshForRealtimeMessage(
    eventType: string | undefined,
    messageItem: IDataMessage,
    currentMessages: IDataMessage[]
): boolean {
  if (eventType === "message.ack") {
    return false;
  }

  return !hasMessage(currentMessages, messageItem);
}

function markMessageFailed(currentMessages: IDataMessage[], clientMsgId: string): IDataMessage[] {
  return currentMessages.map(item => {
    if (item.client_msg_id !== clientMsgId) {
      return item;
    }

    return {
      ...item,
      status: "failed"
    };
  });
}

function replaceSendingMessage(currentMessages: IDataMessage[], nextMessage: IDataMessage): IDataMessage[] {
  if (!nextMessage.client_msg_id) {
    return currentMessages;
  }

  return currentMessages.map(item => {
    if (item.client_msg_id === nextMessage.client_msg_id && item.status === "sending") {
      return nextMessage;
    }

    return item;
  });
}

function isFormValidationError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "errorFields" in error;
}

function getActionErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const errorMessage = String((error as {
      message?: unknown;
    }).message || "");

    if (errorMessage) {
      return errorMessage;
    }
  }

  return fallback;
}

export {
  createLocalSendingMessage,
  formatDateTime,
  getActionErrorMessage,
  getConversationTitle,
  getUserName,
  hasMessage,
  isFormValidationError,
  markMessageFailed,
  mergeMessage,
  pickWsMessage,
  readMessageText,
  replaceSendingMessage,
  shouldRefreshForRealtimeMessage,
  updateConversationSummary
};
