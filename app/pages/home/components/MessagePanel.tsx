import {
  Button, Space, Spin, Typography
} from "antd";
import type {
  ReactElement
} from "react";
import {
  useEffect, useRef, useState
} from "react";

import type {
  TextAreaRef
} from "antd/es/input/TextArea";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  isRenderableMessage, isTextMessage
} from "../utils";
import {
  ChatMessageSkeleton
} from "./message-panel/ChatMessageSkeleton";
import {
  MessageComposer
} from "./message-panel/MessageComposer";
import {
  MessageRow
} from "./message-panel/MessageRow";
import {
  MessageSearchResults
} from "./message-panel/MessageSearchResults";
import {
  WelcomeScreen
} from "./message-panel/WelcomeScreen";

const {
  Text
} = Typography;

const SKELETON_EXIT_DURATION_MS = 240;

interface IMessagePanelProps {
  viewModel: IHomeWorkbenchViewModel;
}

function MessagePanel({
  viewModel
}: IMessagePanelProps): ReactElement {
  const {
    actions, state
  } = viewModel;

  const hasActiveConversation = Boolean(state.activeConversationId);

  const conversationOpening = hasActiveConversation &&
    (state.conversationOpening || state.messageLoading || !state.activeConversation);

  const [
    skeletonPhase,
    setSkeletonPhase
  ] = useState<"hidden" | "leaving" | "visible">(conversationOpening ? "visible" : "hidden");

  const visibleMessages = state.messages.filter(isRenderableMessage);

  const textSearchResults = state.searchResults.filter(isTextMessage);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const messageBottomRef = useRef<HTMLDivElement>(null);

  const messageInputRef = useRef<TextAreaRef>(null);

  const skipNextAutoScrollRef = useRef(false);

  const latestMessage = visibleMessages.at(-1);

  const showSkeleton = skeletonPhase !== "hidden";

  useEffect(() => {
    if (conversationOpening) {
      setSkeletonPhase("visible");

      return;
    }

    setSkeletonPhase(currentPhase => {
      return currentPhase === "visible" ? "leaving" : currentPhase;
    });
  }, [
    conversationOpening
  ]);

  useEffect(() => {
    if (skeletonPhase !== "leaving") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSkeletonPhase("hidden");
    }, SKELETON_EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    skeletonPhase
  ]);

  useEffect(() => {
    if (!hasActiveConversation || state.messageLoading) {
      return;
    }

    if (skipNextAutoScrollRef.current) {
      skipNextAutoScrollRef.current = false;

      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      messageBottomRef.current?.scrollIntoView({
        block: "end"
      });

      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [
    hasActiveConversation,
    latestMessage?.client_msg_id,
    latestMessage?.id,
    latestMessage?.sent_at,
    latestMessage?.status,
    state.activeConversationId,
    state.messageLoading,
    visibleMessages.length
  ]);

  async function handleLoadEarlierMessages(): Promise<void> {
    const scrollContainer = chatScrollRef.current;

    const previousScrollHeight = scrollContainer?.scrollHeight || 0;

    skipNextAutoScrollRef.current = true;
    await actions.handleLoadMoreMessages();

    window.requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop += scrollContainer.scrollHeight - previousScrollHeight;
      }
    });
  }

  function keepMessageInputFocused(): void {
    messageInputRef.current?.focus({
      preventScroll: true
    });
  }

  async function handleSubmitMessage(): Promise<void> {
    keepMessageInputFocused();
    await actions.handleSendMessage();
    window.requestAnimationFrame(() => {
      keepMessageInputFocused();
    });
  }

  return (
    <div className="flow-chat-panel flex h-full min-w-0 flex-col">
      <MessageSearchResults
        actions={actions}
        messages={textSearchResults} />

      <div
        className={`flow-chat-scroll ${hasActiveConversation ? "" : "is-welcome"}`}
        ref={chatScrollRef}>
        <Spin spinning={state.messageLoading && !conversationOpening}>
          {hasActiveConversation ? (
            <Space
              className={`flow-message-stack ${showSkeleton ? "has-skeleton" : ""}`}
              orientation="vertical"
              size={14}>
              {showSkeleton && (
                <div className={`flow-chat-skeleton-layer ${skeletonPhase === "leaving" ? "is-leaving" : ""}`}>
                  <ChatMessageSkeleton />
                </div>
              )}

              {!conversationOpening && (
                <Space
                  className={`flow-message-content-stack ${skeletonPhase === "leaving" ? "is-entering" : ""}`}
                  orientation="vertical"
                  size={14}>
                  {state.hasMoreMessages && (
                    <Button
                      className="self-center"
                      loading={state.loadingMoreMessages}
                      size="small"
                      type="text"
                      onClick={() => {
                        return void handleLoadEarlierMessages();
                      }}>
                      加载更早的流言
                    </Button>
                  )}

                  {visibleMessages.length === 0 && (
                    <div className="flow-chat-empty">
                      <div className="flow-empty-bubble-stack">
                        <span />
                        <span />
                        <span />
                      </div>

                      <Text className="flow-chat-empty-title text-base font-black">
                        还没有流言
                      </Text>

                      <Text className="flow-chat-empty-support mt-1 text-sm">
                        说点什么，让它开始流动
                      </Text>
                    </div>
                  )}

                  {visibleMessages.map(item => {
                    return (
                      <MessageRow
                        key={item.id}
                        message={item}
                        viewModel={viewModel} />
                    );
                  })}

                  <div
                    aria-hidden="true"
                    className="flow-message-bottom-sentinel"
                    ref={messageBottomRef} />
                </Space>
              )}
            </Space>
          ) : (
            <WelcomeScreen />
          )}
        </Spin>
      </div>

      {hasActiveConversation && (
        <MessageComposer
          inputRef={messageInputRef}
          viewModel={viewModel}
          onSubmit={handleSubmitMessage} />
      )}
    </div>
  );
}

export { MessagePanel };
