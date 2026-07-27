import {
  useCallback,
  useRef
} from "react";

import type {
  IDataMessage
} from "~/api";

import type {
  IPendingMessage
} from "./use-home-workbench-helpers";

interface IWritableRef<T> {
  current: T;
}

function usePendingMessageHook(): {
  ackedClientMessageIdsRef: IWritableRef<Set<string>>;
  ackedMessageIdsRef: IWritableRef<Set<number>>;
  clearPendingMessage: (requestId: string) => IPendingMessage | null;
  findPendingMessageByClientId: (clientMsgId?: string) => [
    string,
    IPendingMessage
  ] | null;
  isRecentlyAckedMessage: (messageItem: IDataMessage) => boolean;
  pendingMessagesRef: IWritableRef<Record<string, IPendingMessage>>;
  rememberAckedMessage: (messageItem: IDataMessage) => void;
  } {
  const pendingMessagesRef = useRef<Record<string, IPendingMessage>>({});

  // ack 和 deliver 可能都返回同一条消息；这里记录刚确认过的消息，降低重复刷新概率。
  const ackedMessageIdsRef = useRef<Set<number>>(new Set());

  const ackedClientMessageIdsRef = useRef<Set<string>>(new Set());

  const clearPendingMessage = useCallback((requestId: string): IPendingMessage | null => {
    const pendingMessage = pendingMessagesRef.current[requestId];

    if (!pendingMessage) {
      return null;
    }

    if (pendingMessage.timeoutId) {
      window.clearTimeout(pendingMessage.timeoutId);
    }

    const {
      [requestId]: _removedMessage,
      ...pendingMessages
    } = pendingMessagesRef.current;

    pendingMessagesRef.current = pendingMessages;

    return pendingMessage;
  }, []);

  const findPendingMessageByClientId = useCallback((clientMsgId?: string): [
    string,
    IPendingMessage
  ] | null => {
    if (!clientMsgId) {
      return null;
    }

    return Object.entries(pendingMessagesRef.current).find(([
      ,
      pendingMessage
    ]) => {
      return pendingMessage.clientMsgId === clientMsgId;
    }) || null;
  }, []);

  const rememberAckedMessage = useCallback((messageItem: IDataMessage): void => {
    if (messageItem.id > 0) {
      ackedMessageIdsRef.current.add(messageItem.id);
    }

    if (messageItem.client_msg_id) {
      ackedClientMessageIdsRef.current.add(messageItem.client_msg_id);
    }
  }, []);

  const isRecentlyAckedMessage = useCallback((messageItem: IDataMessage): boolean => {
    return ackedMessageIdsRef.current.has(messageItem.id) || Boolean(messageItem.client_msg_id && ackedClientMessageIdsRef.current.has(messageItem.client_msg_id));
  }, []);

  return {
    ackedClientMessageIdsRef,
    ackedMessageIdsRef,
    clearPendingMessage,
    findPendingMessageByClientId,
    isRecentlyAckedMessage,
    pendingMessagesRef,
    rememberAckedMessage
  };
}

export { usePendingMessageHook };
