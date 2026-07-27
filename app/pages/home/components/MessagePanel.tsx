import {
  FileOutlined,
  PaperClipOutlined,
  ReloadOutlined,
  SendOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Image,
  Input,
  Space,
  Spin,
  Tooltip,
  Typography,
  Upload
} from "antd";
import type {
  UploadProps
} from "antd";
import type {
  ReactElement
} from "react";
import {
  useEffect,
  useRef,
  useState
} from "react";

import type {
  TextAreaRef
} from "antd/es/input/TextArea";

import type {
  IDataMessage
} from "~/api";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  formatDateTime,
  getUserName,
  isFileMessage,
  isImageMessage,
  isRenderableMessage,
  isTextMessage,
  isVideoMessage,
  readMessageText
} from "../utils";

const {
  Text
} = Typography;

const {
  TextArea
} = Input;

const SKELETON_EXIT_DURATION_MS = 240;

interface IMessagePanelProps {
  viewModel: IHomeWorkbenchViewModel;
}

function formatFileSize(size?: number): string {
  if (!size || size <= 0) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function readResourceName(messageItem: IDataMessage): string {
  return typeof messageItem.content?.name === "string" && messageItem.content.name.trim()
    ? messageItem.content.name
    : "资源文件";
}

function isVideoUrl(url?: string): boolean {
  return Boolean(url && (/\.(?:mov|mp4|webm)(?:[?#].*)?$/iu).test(url));
}

function isVideoResource(messageItem: IDataMessage): boolean {
  return isVideoMessage(messageItem) ||
    (
      isFileMessage(messageItem) &&
      (messageItem.content?.type === "video" || isVideoUrl(messageItem.content?.url))
    );
}

function ChatMessageSkeleton(): ReactElement {
  const skeletonRows = [
    {
      align: "peer",
      id: "peer-opening",
      lines: [
        {
          id: "peer-opening-primary",
          width: "44%"
        },
        {
          id: "peer-opening-secondary",
          width: "62%"
        }
      ]
    },
    {
      align: "mine",
      id: "mine-opening",
      lines: [
        {
          id: "mine-opening-primary",
          width: "38%"
        }
      ]
    },
    {
      align: "peer",
      id: "peer-detail",
      lines: [
        {
          id: "peer-detail-primary",
          width: "56%"
        },
        {
          id: "peer-detail-secondary",
          width: "48%"
        },
        {
          id: "peer-detail-tertiary",
          width: "30%"
        }
      ]
    },
    {
      align: "mine",
      id: "mine-detail",
      lines: [
        {
          id: "mine-detail-primary",
          width: "52%"
        },
        {
          id: "mine-detail-secondary",
          width: "34%"
        }
      ]
    }
  ];

  return (
    <div
      aria-label="正在加载流言"
      className="flow-chat-skeleton"
      role="status">
      {skeletonRows.map(row => {
        const isMine = row.align === "mine";

        return (
          <div
            key={row.id}
            className={`flow-chat-skeleton-row ${isMine ? "is-mine" : "is-peer"}`}>
            {!isMine && (
              <span className="flow-chat-skeleton-avatar" />
            )}

            <span className="flow-chat-skeleton-bubble">
              <span className="flow-chat-skeleton-meta" />

              {row.lines.map(line => {
                return (
                  <span
                    key={line.id}
                    className="flow-chat-skeleton-line"
                    style={{
                      width: line.width
                    }} />
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function renderMessageContent(messageItem: IDataMessage): ReactElement {
  if (isImageMessage(messageItem)) {
    const resourceName = readResourceName(messageItem);

    const resourceUrl = messageItem.content?.url || "";

    return (
      <Image
        alt={resourceName}
        className="flow-message-image"
        preview={{
          mask: "预览图片"
        }}
        src={resourceUrl} />
    );
  }

  if (isVideoResource(messageItem)) {
    const resourceName = readResourceName(messageItem);

    const resourceUrl = messageItem.content?.url || "";

    const fileSize = typeof messageItem.content?.size === "number" ? formatFileSize(messageItem.content.size) : "";

    return (
      <div className="flow-message-video-card">
        <video
          className="flow-message-video"
          controls
          preload="metadata"
          src={resourceUrl} />

        <a
          className="flow-message-resource-link"
          href={resourceUrl}
          rel="noreferrer"
          target="_blank">
          {resourceName}
          {fileSize ? ` · ${fileSize}` : ""}
        </a>
      </div>
    );
  }

  if (isFileMessage(messageItem)) {
    const resourceName = readResourceName(messageItem);

    const resourceUrl = messageItem.content?.url || "";

    const fileSize = typeof messageItem.content?.size === "number" ? formatFileSize(messageItem.content.size) : "";

    return (
      <a
        className="flow-message-file"
        href={resourceUrl}
        rel="noreferrer"
        target="_blank">
        <span className="flow-message-file-icon">
          <FileOutlined />
        </span>

        <span className="flow-message-file-copy">
          <span className="flow-message-file-name">
            {resourceName}
          </span>

          {fileSize && (
            <span className="flow-message-file-meta">
              {fileSize}
            </span>
          )}
        </span>
      </a>
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-6">
      {readMessageText(messageItem)}
    </div>
  );
}

function MessagePanel({
  viewModel
}: IMessagePanelProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const hasActiveConversation = Boolean(state.activeConversationId);

  const conversationOpening = hasActiveConversation && (state.conversationOpening || state.messageLoading || !state.activeConversation);

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

  const resourceUploadProps: UploadProps = {
    accept: ".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm,image/*,video/*",
    beforeUpload(file) {
      void actions.handleSendResource(file);

      return Upload.LIST_IGNORE;
    },
    disabled: state.resourceUploading || state.sending,
    maxCount: 1,
    showUploadList: false
  };

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

    // 记录插入历史消息前后的高度差，避免分页完成后视口跳到列表顶部或最新消息。
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
      {/* 搜索结果只展示轻量预览，点击会话或清空后回到正常消息流。 */}
      {textSearchResults.length > 0 && (
        <div
          aria-live="polite"
          className="flow-search-results border-b px-6 py-3"
          role="status">
          <Space
            className="w-full"
            orientation="vertical">
            <div className="flex items-center justify-between">
              <Text strong>
                找到
                {" "}
                {textSearchResults.length}
                {" "}
                条消息
              </Text>

              <Button
                size="small"
                type="text"
                onClick={() => {
                  return actions.setSearchResults([]);
                }}>
                清空
              </Button>
            </div>

            {textSearchResults.slice(0, 5).map(item => {
              return (
                <button
                  key={item.id}
                  className="flow-search-result-item flex w-full items-center justify-between gap-4 text-left"
                  type="button"
                  onClick={() => {
                    return actions.handleOpenSearchResult(item);
                  }}>
                  <Text ellipsis>
                    {readMessageText(item)}
                  </Text>

                  <time>
                    {formatDateTime(item.sent_at)}
                  </time>
                </button>
              );
            })}
          </Space>
        </div>
      )}

      <div
        className={`flow-chat-scroll ${hasActiveConversation ? "" : "is-welcome"}`}
        ref={chatScrollRef}>
        <Spin spinning={state.messageLoading && !conversationOpening}>
          {hasActiveConversation ? (

            // 消息区按左右对齐区分自己和他人；消息去重/排序在 hook 与 utils 中完成。
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
                    const isMine = item.sender_id === state.currentUser?.id;

                    const sender = state.users.find(user => {
                      return user.id === item.sender_id;
                    });

                    const messageUser = isMine ? state.currentUser : sender;

                    const messageName = getUserName(messageUser);

                    const messageAvatar = (
                      <Avatar
                        className="shrink-0 font-bold"
                        size={32}
                        src={messageUser?.avatar_url || undefined}>
                        {messageName.slice(0, 1)}
                      </Avatar>
                    );

                    return (
                      <div
                        key={item.id}
                        className={`flow-message-row ${isMine ? "is-mine justify-end" : "is-peer justify-start"} flex items-end gap-2`}>
                        {!isMine && messageAvatar}

                        <div className={`flow-message-group group ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                          <Text className={`flow-message-meta mb-1 text-xs ${item.status === "failed" ? "is-failed" : ""} ${isMine ? "text-right" : ""}`}>
                            {messageName}
                            {" · "}
                            {formatDateTime(item.sent_at)}
                            {item.status === "sending" && " · 发送中"}
                            {item.status === "failed" && " · 发送失败"}
                          </Text>

                          <div className={`flow-message-bubble ${isMine ? "is-mine" : ""} ${item.status === "failed" ? "is-failed" : ""}`}>
                            {renderMessageContent(item)}
                          </div>

                          {item.status === "failed" && (
                            <Button
                              danger
                              icon={<ReloadOutlined />}
                              size="small"
                              type="text"
                              onClick={() => {
                                return void actions.handleRetryMessage(item);
                              }}>
                              重试
                            </Button>
                          )}
                        </div>

                        {isMine && messageAvatar}
                      </div>
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
            <div className="flow-default-screen">
              <div
                className="flow-signal-visual"
                aria-hidden="true">
                <span className="flow-signal-line is-one">
                  <i />
                </span>

                <span className="flow-signal-line is-two">
                  <i />
                </span>

                <span className="flow-signal-line is-three">
                  <i />
                </span>

                <div className="flow-signal-core">
                  <span>F</span>
                  <i />
                </div>
              </div>

              <div className="flow-default-copy">
                <Text className="flow-default-eyebrow">THE WORD IS OUT</Text>
                <Text className="flow-default-title">听听他们在说什么</Text>

                <Text className="flow-default-support">
                  最近流言、未读消息和在线的人都在左侧。
                </Text>
              </div>
            </div>
          )}
        </Spin>
      </div>

      {hasActiveConversation && (
        <footer className="flow-composer">
          <div className="flow-composer-inner">
            <Tooltip title="发送图片或视频">
              <Upload {...resourceUploadProps}>
                <Button
                  aria-label="发送文件"
                  className="flow-resource-button"
                  icon={<PaperClipOutlined />}
                  loading={state.resourceUploading}
                  type="text" />
              </Upload>
            </Tooltip>

            <TextArea
              aria-label="流言内容"
              autoSize={{
                maxRows: 4,
                minRows: 1
              }}
              className="flow-message-input"
              disabled={state.resourceUploading}
              enterKeyHint="send"
              placeholder={state.resourceUploading ? "资源上传中…" : "说点什么…"}
              ref={messageInputRef}
              value={state.draftText}
              onChange={event => {
                return actions.setDraftText(event.target.value);
              }}
              onPressEnter={event => {
                if (event.shiftKey) {
                  return;
                }

                // Enter 发送、Shift+Enter 换行，保持即时通讯工具的常见输入体验。
                event.preventDefault();
                void handleSubmitMessage();
              }} />

            <Button
              aria-label="发送消息"
              className="flow-send-button"
              disabled={!state.draftText.trim() || state.resourceUploading}
              icon={<SendOutlined />}
              loading={state.sending}
              type="primary"
              onMouseDown={event => {
                event.preventDefault();
              }}
              onPointerDown={event => {
                event.preventDefault();
              }}
              onClick={() => {
                return void handleSubmitMessage();
              }} />
          </div>
        </footer>
      )}
    </div>
  );
}

export { MessagePanel };
