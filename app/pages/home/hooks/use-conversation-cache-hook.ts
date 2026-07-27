import {
  useCallback,
  useRef
} from "react";
import type {
  Dispatch,
  SetStateAction
} from "react";

import type {
  IDataConversation,
  IDataConversationListItem,
  IDataMessage
} from "~/api";

interface IWritableRef<T> {
  current: T;
}

interface IConversationCacheEntry {
  conversation: IDataConversation | IDataConversationListItem | null;
  hasMoreMessages: boolean;
  isLoaded: boolean;
  messages: IDataMessage[];
  nextBeforeMessageId: number | null;
  updatedAt: number;
}

interface IUseConversationCacheHookParams {
  conversationsRef: IWritableRef<IDataConversationListItem[]>;
  setActiveConversation: Dispatch<SetStateAction<IDataConversation | null>>;
  setHasMoreMessages: Dispatch<SetStateAction<boolean>>;
  setMessages: Dispatch<SetStateAction<IDataMessage[]>>;
  syncNextBeforeMessageId: (nextBeforeMessageId: number | null) => void;
}

function useConversationCacheHook({
  conversationsRef,
  setActiveConversation,
  setHasMoreMessages,
  setMessages,
  syncNextBeforeMessageId
}: IUseConversationCacheHookParams): {
  applyConversationCache: (conversationId: number) => boolean;
  conversationCacheRef: IWritableRef<Map<number, IConversationCacheEntry>>;
  writeConversationCache: (conversationId: number, patch: Partial<Omit<IConversationCacheEntry, "updatedAt">>) => void;
} {
  const conversationCacheRef = useRef<Map<number, IConversationCacheEntry>>(new Map());

  const writeConversationCache = useCallback((conversationId: number, patch: Partial<Omit<IConversationCacheEntry, "updatedAt">>): void => {
    const currentCache = conversationCacheRef.current.get(conversationId);

    conversationCacheRef.current.set(conversationId, {
      conversation: Object.hasOwn(patch, "conversation") ? patch.conversation ?? null : currentCache?.conversation ?? null,
      hasMoreMessages: patch.hasMoreMessages ?? currentCache?.hasMoreMessages ?? false,
      isLoaded: patch.isLoaded ?? currentCache?.isLoaded ?? false,
      messages: patch.messages ?? currentCache?.messages ?? [],
      nextBeforeMessageId: Object.hasOwn(patch, "nextBeforeMessageId") ? patch.nextBeforeMessageId ?? null : currentCache?.nextBeforeMessageId ?? null,
      updatedAt: Date.now()
    });
  }, []);

  const applyConversationCache = useCallback((conversationId: number): boolean => {
    const cachedConversation = conversationCacheRef.current.get(conversationId);

    if (!cachedConversation?.isLoaded) {
      return false;
    }

    const conversationSummary = conversationsRef.current.find(conversation => {
      return conversation.id === conversationId;
    });

    setActiveConversation(cachedConversation.conversation || conversationSummary || null);
    setMessages(cachedConversation.messages);
    setHasMoreMessages(cachedConversation.hasMoreMessages);
    syncNextBeforeMessageId(cachedConversation.nextBeforeMessageId);

    return true;
  }, [
    conversationsRef,
    setActiveConversation,
    setHasMoreMessages,
    setMessages,
    syncNextBeforeMessageId
  ]);

  return {
    applyConversationCache,
    conversationCacheRef,
    writeConversationCache
  };
}

export { useConversationCacheHook };
