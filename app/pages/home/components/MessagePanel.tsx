import {
  CheckSquareOutlined,
  DeleteOutlined,
  MessageOutlined,
  PaperClipOutlined,
  RollbackOutlined,
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

  return (
    <div className="flow-chat-panel flex h-full min-w-0 flex-col bg-[#f5f7fb]">
      {state.searchResults.length > 0 && (
        <div className="border-b border-[#eadfb8] bg-[#fff8df] px-6 py-3">
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
          {state.activeConversationId ? (
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

                return (
                  <div
                    key={item.id}
                    className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                    {!isMine && (
                      <Avatar
                        className="shrink-0 bg-[#e7f3ff] font-bold text-[#1877f2]"
                        size={32}>
                        {getUserName(sender).slice(0, 1)}
                      </Avatar>
                    )}

                    <div className={`flow-message-group group ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                      <Text className={`mb-1 text-xs ${isMine ? "text-right text-[#8a8d91]" : "text-[#65676b]"}`}>
                        {isMine ? "你" : getUserName(sender)}
                        {" · "}
                        {formatDateTime(item.sent_at)}
                      </Text>

                      <div className={`flow-message-bubble ${isMine ? "is-mine" : ""}`}>
                        <div className="whitespace-pre-wrap break-words text-sm leading-6">
                          {readMessageText(item)}
                        </div>
                      </div>

                      <Space
                        className="mt-1 opacity-70 transition group-hover:opacity-100"
                        size={2}>
                        <Tooltip title="回执">
                          <Button
                            icon={<CheckSquareOutlined />}
                            size="small"
                            type="text"
                            onClick={() => {
                              return void actions.handleOpenReceipts(item.id);
                            }} />
                        </Tooltip>

                        {isMine && item.status !== "recalled" && (
                          <Tooltip title="撤回">
                            <Button
                              icon={<RollbackOutlined />}
                              size="small"
                              type="text"
                              onClick={() => {
                                return void actions.handleRecallMessage(item.id);
                              }} />
                          </Tooltip>
                        )}

                        {isMine && item.status !== "deleted" && (
                          <Tooltip title="删除">
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              type="text"
                              onClick={() => {
                                return void actions.handleDeleteMessage(item.id);
                              }} />
                          </Tooltip>
                        )}
                      </Space>
                    </div>
                  </div>
                );
              })}
            </Space>
          ) : (
            <div className="grid h-full min-h-96 place-items-center">
              <div className="flow-chat-empty">
                <div className="flow-chat-empty-icon">
                  <MessageOutlined />
                </div>

                <Text className="text-lg font-black text-[#050505]">
                  选择一个会话
                </Text>

                <Text className="mt-1 text-sm text-[#65676b]">
                  准备开始新的对话
                </Text>
              </div>
            </div>
          )}
        </Spin>
      </div>

      <footer className="flow-composer">
        <div className="flow-composer-inner">
          <Tooltip title="附件">
            <Button
              className="flow-icon-button"
              disabled={!state.activeConversationId}
              icon={<PaperClipOutlined />}
              shape="circle" />
          </Tooltip>

          <TextArea
            autoSize={{
              maxRows: 4,
              minRows: 1
            }}
            className="flow-message-input"
            disabled={!state.activeConversationId}
            placeholder="输入消息，Enter 发送，Shift + Enter 换行"
            value={state.draftText}
            onChange={event => {
              return actions.setDraftText(event.target.value);
            }}
            onPressEnter={event => {
              if (event.shiftKey) {
                return;
              }

              event.preventDefault();
              void actions.handleSendMessage();
            }} />

          <Button
            className="flow-send-button"
            disabled={!state.activeConversationId}
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
