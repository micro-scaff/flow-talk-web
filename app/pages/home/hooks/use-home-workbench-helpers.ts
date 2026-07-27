import {
  dataListUsers,
  dataMarkMessageRead
} from "~/api";
import type {
  IDataListUsers,
  IDataMessage,
  IDataPresence
} from "~/api";

const MESSAGE_ACK_TIMEOUT_MS = 8000;

// 多条实时消息连续到达时合并刷新会话列表，避免短时间内重复打接口。
const REALTIME_REFRESH_DEBOUNCE_MS = 200;

// 后端当前没有 user.created 实时事件；页面可见时轻量校准通讯录，补齐新注册用户。
const USER_LIST_REFRESH_INTERVAL_MS = 15_000;

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  "gif",
  "jpeg",
  "jpg",
  "png",
  "webp"
]);

const SUPPORTED_VIDEO_EXTENSIONS = new Set([
  "mov",
  "mp4",
  "webm"
]);

interface IPendingMessage {
  clientMsgId: string;
  content: IDataMessage["content"];
  conversationId: number;
  messageType: IDataMessage["message_type"];
  timeoutId?: number;
}

function getFileExtension(filename: string): string {
  return filename.split(".").at(-1)?.toLocaleLowerCase("en-US") || "";
}

function pickUploadResourceType(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  const extension = getFileExtension(file.name);

  if (SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  return null;
}

function getUserListSignature(userList: IDataListUsers): string {
  return userList.map(user => {
    return [
      user.id,
      user.username || "",
      user.nickname || "",
      user.avatar_url || "",
      user.status || 0
    ].join(":");
  }).join("|");
}

function dataListAllUsers(): Promise<IDataListUsers> {
  return dataListUsers({
    all: true
  });
}

function isMobileWorkbenchViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 820px)").matches;
}

// 消息接口按倒序分页返回，视图层统一使用升序，避免多个调用点各自维护排序规则。
function sortMessagesById(messages: IDataMessage[]): IDataMessage[] {
  return [
    ...messages
  // eslint-disable-next-line unicorn/no-array-sort
  ].sort((source, target) => {
    return source.id - target.id;
  });
}

// 使用 Map 合并分页数据，把原先逐项 findIndex 的 O(n²) 去重降为 O(n)。
function mergeMessagePage(currentMessages: IDataMessage[], pageItems: IDataMessage[]): IDataMessage[] {
  const messagesById = new Map<number, IDataMessage>();

  for (const messageItem of [
    ...pageItems,
    ...currentMessages
  ]) {
    if (!messagesById.has(messageItem.id)) {
      messagesById.set(messageItem.id, messageItem);
    }
  }

  return sortMessagesById([
    ...messagesById.values()
  ]);
}

// 单条回执是辅助状态，只为尚未越过会话已读游标的新消息写入，避免每次打开会话重复更新整页回执。
function markIncomingMessagesRead(messages: IDataMessage[], currentUserId?: number, lastReadMessageId = 0): void {
  const messageIds = messages.
      filter(messageItem => {
        return messageItem.id > lastReadMessageId && messageItem.sender_id !== currentUserId;
      }).
      map(messageItem => {
        return messageItem.id;
      });

  if (messageIds.length === 0) {
    return;
  }

  void Promise.all(messageIds.map(messageId => {
    return dataMarkMessageRead({
      message_id: messageId
    });
  })).catch(() => {

    // 回执失败不阻断消息阅读，请求层已经负责用户可见的错误提示。
  });
}

function pickWsPresence(payload: unknown): IDataPresence | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("user_id" in payload && "online" in payload) {
    return payload as IDataPresence;
  }

  return null;
}

function pickWsUnreadState(payload: unknown): {
  ["conversation_id"]: number;
  ["last_message_id"]?: number;
  ["last_read_at"]?: string;
  ["last_read_message_id"]?: number;
  revision?: number;
  ["unread_count"]?: number;
} | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("conversation_id" in payload && "unread_count" in payload) {
    return payload as {
      ["conversation_id"]: number;
      ["last_message_id"]?: number;
      ["last_read_at"]?: string;
      ["last_read_message_id"]?: number;
      revision?: number;
      ["unread_count"]?: number;
    };
  }

  return null;
}

export {
  dataListAllUsers,
  getUserListSignature,
  isMobileWorkbenchViewport,
  markIncomingMessagesRead,
  mergeMessagePage,
  MESSAGE_ACK_TIMEOUT_MS,
  pickUploadResourceType,
  pickWsPresence,
  pickWsUnreadState,
  REALTIME_REFRESH_DEBOUNCE_MS,
  sortMessagesById,
  USER_LIST_REFRESH_INTERVAL_MS
};
export type { IPendingMessage };
