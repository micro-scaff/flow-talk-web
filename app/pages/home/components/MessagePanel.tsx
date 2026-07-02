import {
  SendOutlined
} from "@ant-design/icons";
import {
  Button,
  Empty,
  Input,
  Space,
  Spin,
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
    <div className="flex min-w-0 flex-col">
      {state.searchResults.length > 0 && (
        <div className="border-b border-[#dadde1] bg-[#fff4d6] px-6 py-3">
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

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f0f2f5] px-6 py-5">
        <Spin spinning={state.messageLoading}>
          {state.activeConversationId ? (
            <Space
              className="w-full"
              direction="vertical"
              size={12}>
              {state.messages.length === 0 && (
                <Empty description="暂无消息，发出第一条吧" />
              )}

              {state.messages.map(item => {
                const isMine = item.sender_id === state.currentUser?.id;

                return (
                  <div
                    key={item.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[72%] rounded-lg px-4 py-3 shadow-sm ${isMine ? "bg-[#0084ff] text-white" : "bg-white text-[#050505]"}`}>
                      <div className="mb-1 flex items-center justify-between gap-4">
                        <Text className={isMine ? "!text-blue-50" : "text-[#65676b]"}>
                          #
                          {item.sender_id}
                        </Text>

                        <Text className={`text-xs ${isMine ? "!text-blue-100" : "text-[#8a8d91]"}`}>
                          {formatDateTime(item.sent_at)}
                        </Text>
                      </div>

                      <div className="whitespace-pre-wrap break-words text-sm leading-6">
                        {readMessageText(item)}
                      </div>

                      <div className="mt-2 flex justify-end gap-1">
                        <Button
                          size="small"
                          type="text"
                          onClick={() => {
                            return void actions.handleOpenReceipts(item.id);
                          }}>
                          回执
                        </Button>

                        {isMine && item.status !== "recalled" && (
                          <Button
                            size="small"
                            type="text"
                            onClick={() => {
                              return void actions.handleRecallMessage(item.id);
                            }}>
                            撤回
                          </Button>
                        )}

                        {isMine && item.status !== "deleted" && (
                          <Button
                            size="small"
                            type="text"
                            onClick={() => {
                              return void actions.handleDeleteMessage(item.id);
                            }}>
                            删除
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Space>
          ) : (
            <Empty description="选择或创建一个会话" />
          )}
        </Spin>
      </div>

      {/* 输入区固定在底部，避免消息列表滚动时丢失主要操作。 */}
      <footer className="border-t border-[#dadde1] bg-white p-4">
        <Space.Compact className="w-full">
          <TextArea
            autoSize={{
              maxRows: 4,
              minRows: 1
            }}
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
            disabled={!state.activeConversationId}
            icon={<SendOutlined />}
            loading={state.sending}
            type="primary"
            onClick={() => {
              return void actions.handleSendMessage();
            }}>
            发送
          </Button>
        </Space.Compact>
      </footer>
    </div>
  );
}

export { MessagePanel };
