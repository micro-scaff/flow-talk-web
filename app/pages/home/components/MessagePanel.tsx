import {
  PaperClipOutlined,
  SendOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Input,
  Space,
  Spin,
  Tooltip,
  Typography
} from "antd";
import type {
  ReactElement
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

  return (
    <div className="flow-chat-panel flex h-full min-w-0 flex-col bg-[#f5f7fb]">
      {/* 搜索结果只展示轻量预览，点击会话或清空后回到正常消息流。 */}
      {hasActiveConversation && state.searchResults.length > 0 && (
        <div className="flow-search-results border-b border-[#eadfb8] bg-[#fff8df] px-6 py-3">
          <Space
            className="w-full"
            orientation="vertical">
            <div className="flex items-center justify-between">
              <Text strong>
                搜索结果
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
                  className="block text-[#65676b]"
                  ellipsis>
                  #
                  {item.id}
                  {" "}
                  {readMessageText(item)}
                </Text>
              );
            })}
          </Space>
        </div>
      )}

      <div className={`flow-chat-scroll ${hasActiveConversation ? "" : "is-welcome"}`}>
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

                  <Text className="text-base font-black text-[#050505]">
                    暂无消息
                  </Text>

                  <Text className="mt-1 text-sm text-[#65676b]">
                    发送第一条消息
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
                    className="shrink-0 bg-[#e7f3ff] font-bold text-[#1877f2]"
                    size={32}
                    src={messageUser?.avatar_url || undefined}>
                    {messageName.slice(0, 1)}
                  </Avatar>
                );

                return (
                  <div
                    key={item.id}
                    className={`flow-message-row flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                    {!isMine && messageAvatar}

                    <div className={`flow-message-group group ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                      <Text className={`mb-1 text-xs ${isMine ? "text-right text-[#8a8d91]" : "text-[#65676b]"}`}>
                        {messageName}
                        {" · "}
                        {formatDateTime(item.sent_at)}
                        {item.status === "sending" && " · 发送中"}
                        {item.status === "failed" && " · 发送失败"}
                      </Text>

                      <div className={`flow-message-bubble ${isMine ? "is-mine" : ""}`}>
                        <div className="whitespace-pre-wrap break-words text-sm leading-6">
                          {readMessageText(item)}
                        </div>
                      </div>
                    </div>

                    {isMine && messageAvatar}
                  </div>
                );
              })}
            </Space>
          ) : (
            <div className="flow-default-screen">
              <div
                aria-hidden="true"
                className="flow-welcome-canvas">
                <svg
                  className="flow-welcome-paths"
                  preserveAspectRatio="none"
                  viewBox="0 0 800 460">
                  <path d="M92 118 C230 118 244 216 400 230" />
                  <path d="M708 104 C570 104 556 198 400 230" />
                  <path d="M96 356 C244 356 264 258 400 230" />
                  <path d="M704 350 C562 350 548 264 400 230" />

                  <circle
                    className="flow-welcome-particle"
                    r="4">
                    <animateMotion
                      dur="4.6s"
                      path="M92 118 C230 118 244 216 400 230"
                      repeatCount="indefinite" />
                  </circle>

                  <circle
                    className="flow-welcome-particle is-soft"
                    r="3">
                    <animateMotion
                      begin="-2.3s"
                      dur="4.6s"
                      path="M92 118 C230 118 244 216 400 230"
                      repeatCount="indefinite" />
                  </circle>

                  <circle
                    className="flow-welcome-particle is-green"
                    r="4">
                    <animateMotion
                      begin="-1.2s"
                      dur="4.6s"
                      path="M708 104 C570 104 556 198 400 230"
                      repeatCount="indefinite" />
                  </circle>

                  <circle
                    className="flow-welcome-particle is-green is-soft"
                    r="3">
                    <animateMotion
                      begin="-3.5s"
                      dur="4.6s"
                      path="M708 104 C570 104 556 198 400 230"
                      repeatCount="indefinite" />
                  </circle>

                  <circle
                    className="flow-welcome-particle"
                    r="4">
                    <animateMotion
                      begin="-2.35s"
                      dur="4.6s"
                      path="M96 356 C244 356 264 258 400 230"
                      repeatCount="indefinite" />
                  </circle>

                  <circle
                    className="flow-welcome-particle is-soft"
                    r="3">
                    <animateMotion
                      begin="-4.65s"
                      dur="4.6s"
                      path="M96 356 C244 356 264 258 400 230"
                      repeatCount="indefinite" />
                  </circle>

                  <circle
                    className="flow-welcome-particle is-green"
                    r="4">
                    <animateMotion
                      begin="-3.5s"
                      dur="4.6s"
                      path="M704 350 C562 350 548 264 400 230"
                      repeatCount="indefinite" />
                  </circle>

                  <circle
                    className="flow-welcome-particle is-green is-soft"
                    r="3">
                    <animateMotion
                      begin="-5.8s"
                      dur="4.6s"
                      path="M704 350 C562 350 548 264 400 230"
                      repeatCount="indefinite" />
                  </circle>
                </svg>

                <div className="flow-welcome-sparks">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>

                <div className="flow-welcome-message is-left is-upper">
                  <span className="flow-welcome-avatar">A</span>

                  <span className="flow-welcome-lines">
                    <i />
                    <i />
                  </span>

                  <span className="flow-welcome-delivered">✓</span>
                </div>

                <div className="flow-welcome-message is-right is-upper">
                  <span className="flow-welcome-avatar is-green">L</span>

                  <span className="flow-welcome-lines">
                    <i />
                    <i />
                  </span>

                  <span className="flow-welcome-delivered">✓</span>
                </div>

                <div className="flow-welcome-message is-left is-lower">
                  <span className="flow-welcome-avatar is-violet">M</span>

                  <span className="flow-welcome-lines">
                    <i />
                    <i />
                  </span>

                  <span className="flow-welcome-delivered">✓</span>
                </div>

                <div className="flow-welcome-message is-right is-lower">
                  <span className="flow-welcome-avatar is-orange">K</span>

                  <span className="flow-welcome-lines">
                    <i />
                    <i />
                  </span>

                  <span className="flow-welcome-delivered">✓</span>
                </div>
              </div>

              <div className="flow-default-hero">
                <div
                  aria-hidden="true"
                  className="flow-welcome-aura">
                  <span />
                  <span />
                  <span />
                </div>

                <div
                  aria-hidden="true"
                  className="flow-welcome-orbit">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="flow-default-mark">
                  <span>FT</span>
                  <i className="flow-welcome-online" />
                </div>

                <Text className="flow-default-title">
                  欢迎使用 Flow Talk
                </Text>
              </div>
            </div>
          )}
        </Spin>
      </div>

      {hasActiveConversation && (
        <footer className="flow-composer">
          <div className="flow-composer-inner">
            <Tooltip title="附件">
              <Button
                className="flow-icon-button"
                icon={<PaperClipOutlined />}
                shape="circle" />
            </Tooltip>

            <TextArea
              autoSize={{
                maxRows: 4,
                minRows: 2
              }}
              className="flow-message-input"
              placeholder="输入消息，Enter 发送，Shift + Enter 换行"
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
              className="flow-send-button"
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
