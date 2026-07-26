import {
  SendOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Input,
  Space,
  Spin,
  Typography
} from "antd";
import type {
  ReactElement
} from "react";
import {
  useEffect,
  useRef
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  formatDateTime,
  getUserName,
  readMessageText
} from "../utils";

const {
  Text
} = Typography;

const {
  TextArea
} = Input;

interface IMessagePanelProps {
  viewModel: IHomeWorkbenchViewModel;
}

function MessagePanel({
  viewModel
}: IMessagePanelProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const hasActiveConversation = Boolean(state.activeConversationId);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const messageBottomRef = useRef<HTMLDivElement>(null);

  const latestMessage = state.messages.at(-1);

  useEffect(() => {
    if (!hasActiveConversation || state.messageLoading) {
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
    state.messages.length
  ]);

  return (
    <div className="flow-chat-panel flex h-full min-w-0 flex-col">
      {/* 搜索结果只展示轻量预览，点击会话或清空后回到正常消息流。 */}
      {hasActiveConversation && state.searchResults.length > 0 && (
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
                {state.searchResults.length}
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

            {state.searchResults.slice(0, 3).map(item => {
              return (
                <Text
                  key={item.id}
                  className="flow-search-result-item block"
                  ellipsis>
                  {readMessageText(item)}

                  <time>
                    {formatDateTime(item.sent_at)}
                  </time>
                </Text>
              );
            })}
          </Space>
        </div>
      )}

      <div
        className={`flow-chat-scroll ${hasActiveConversation ? "" : "is-welcome"}`}
        ref={chatScrollRef}>
        <Spin spinning={state.messageLoading}>
          {hasActiveConversation ? (

            // 消息区按左右对齐区分自己和他人；消息去重/排序在 hook 与 utils 中完成。
            <Space
              className="flow-message-stack"
              orientation="vertical"
              size={14}>
              {state.messages.length === 0 && (
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

              {state.messages.map(item => {
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
                        <div className="whitespace-pre-wrap break-words text-sm leading-6">
                          {readMessageText(item)}
                        </div>
                      </div>
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
            <TextArea
              aria-label="流言内容"
              autoSize={{
                maxRows: 4,
                minRows: 1
              }}
              className="flow-message-input"
              enterKeyHint="send"
              placeholder="说点什么，Enter 发送，Shift + Enter 换行"
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
                void actions.handleSendMessage();
              }} />

            <Button
              aria-label="发送消息"
              className="flow-send-button"
              disabled={!state.draftText.trim()}
              icon={<SendOutlined />}
              loading={state.sending}
              type="primary"
              onClick={() => {
                return void actions.handleSendMessage();
              }} />
          </div>
        </footer>
      )}
    </div>
  );
}

export { MessagePanel };
