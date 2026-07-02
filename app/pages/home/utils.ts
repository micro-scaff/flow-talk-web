import type {
  IDataConversation,
  IDataConversationListItem,
  IDataGetCurrentUser,
  IDataMessage
} from "~/api";

type TNamedUser = Pick<IDataGetCurrentUser, "id" | "nickname" | "username">;

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
  formatDateTime,
  getActionErrorMessage,
  getConversationTitle,
  getUserName,
  isFormValidationError,
  pickWsMessage,
  readMessageText
};
