import {
  CheckCircleOutlined,
  MessageOutlined,
  PaperClipOutlined,
  SendOutlined,
  TeamOutlined
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

  const selectedCount = state.selectedGroupUserIds.length;

  return (
    <div className="flow-chat-panel flex h-full min-w-0 flex-col bg-[#f5f7fb]">
      {/* 搜索结果只展示轻量预览，点击会话或清空后回到正常消息流。 */}
      {state.searchResults.length > 0 && (
        <div className="flow-search-results border-b border-[#eadfb8] bg-[#fff8df] px-6 py-3">
          <Space
            className="w-full"
            direction="vertical">
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

      <div className="flow-chat-scroll">
        <Spin spinning={state.messageLoading}>
          {hasActiveConversation ? (

            // 消息区按左右对齐区分自己和他人；消息去重/排序在 hook 与 utils 中完成。
            <Space
              className="flow-message-stack"
              direction="vertical"
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
                    src={messageUser?.avatar_url}>
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
              <div className="flow-default-hero">
                <div className="flow-default-mark">
                  FT
                </div>

                <Text className="flow-default-title">
                  Flow Talk
                </Text>

                <Text className="flow-default-copy">
                  从联系人栏选择人员，再点击右上角创建对话；选择 1 人开始单聊，选择多人创建群聊。
                </Text>

                <div className="flow-default-actions">
                  <div className="flow-default-pill">
                    <MessageOutlined />
                    <span>选择联系人</span>
                  </div>

                  <div className="flow-default-pill">
                    <TeamOutlined />

                    <span>
                      {selectedCount > 0 ? `已选 ${selectedCount} 人` : "未选择人员"}
                    </span>
                  </div>

                  <div className="flow-default-pill">
                    <CheckCircleOutlined />

                    <span>
                      {`${state.onlineCount} 位在线`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Spin>
      </div>

      <footer className={`flow-composer ${hasActiveConversation ? "" : "is-idle"}`}>
        <div className="flow-composer-inner">
          <Tooltip title="附件">
            <Button
              className="flow-icon-button"
              disabled={!hasActiveConversation}
              icon={<PaperClipOutlined />}
              shape="circle" />
          </Tooltip>

          {hasActiveConversation ? (
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
          ) : (
            <div className="flow-idle-input">
              选择一个会话后开始输入
            </div>
          )}

          <Button
            className="flow-send-button"
            disabled={!hasActiveConversation}
            icon={<SendOutlined />}
            loading={state.sending}
            type="primary"
            onClick={() => {
              return void actions.handleSendMessage();
            }} />
        </div>
      </footer>
    </div>
  );
}

export { MessagePanel };
