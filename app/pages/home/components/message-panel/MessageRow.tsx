import {
  ReloadOutlined,
  UndoOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Modal,
  Typography
} from "antd";
import type {
  ReactElement
} from "react";
import {
  useRef
} from "react";

import type {
  IDataMessage
} from "~/api";

import type {
  IHomeWorkbenchViewModel
} from "../../type";
import {
  formatDateTime,
  getUserName
} from "../../utils";
import {
  renderMessageContent
} from "./message-content";

const {
  Text
} = Typography;

interface IMessageRowProps {
  message: IDataMessage;
  viewModel: IHomeWorkbenchViewModel;
}

function MessageRow({
  message,
  viewModel
}: IMessageRowProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const isMine = message.sender_id === state.currentUser?.id;

  const recallConfirmOpenRef = useRef(false);

  const canRecallMessage = isMine && message.id > 0 && message.status === "normal";

  const sender = state.users.find(user => {
    return user.id === message.sender_id;
  });

  const messageUser = isMine ? state.currentUser : sender;

  const messageName = getUserName(messageUser);

  function renderMessageAvatar(): ReactElement {
    return (
      <Avatar
        className="flow-message-avatar shrink-0 font-bold"
        size={32}
        src={messageUser?.avatar_url || undefined}>
        {messageName.slice(0, 1)}
      </Avatar>
    );
  }

  function confirmRecallMessage(): void {
    if (!canRecallMessage || recallConfirmOpenRef.current) {
      return;
    }

    recallConfirmOpenRef.current = true;
    Modal.confirm({
      cancelText: "取消",
      content: "撤回后，这条消息会从聊天记录删除。",
      okText: "撤回",
      okType: "danger",
      title: "确认撤回这条消息？",
      afterClose() {
        recallConfirmOpenRef.current = false;
      },
      onOk() {
        return actions.handleRecallMessage(message);
      }
    });
  }

  return (
    <div className={`flow-message-row ${isMine ? "is-mine justify-end" : "is-peer justify-start"} flex items-end gap-2`}>
      {!isMine && renderMessageAvatar()}

      <div className={`flow-message-group group ${isMine ? "is-mine items-end" : "is-peer items-start"} flex flex-col`}>
        <Text className={`flow-message-meta mb-1 text-xs ${message.status === "failed" ? "is-failed" : ""} ${isMine ? "text-right" : ""}`}>
          {messageName}
          {" · "}
          {formatDateTime(message.sent_at)}
          {message.status === "sending" && " · 发送中"}
          {message.status === "failed" && " · 发送失败"}
        </Text>

        <div className={`flow-message-bubble-line ${isMine ? "is-mine" : "is-peer"}`}>
          {canRecallMessage && (
            <Button
              aria-label="撤回消息"
              className="flow-message-recall-mobile"
              icon={<UndoOutlined />}
              shape="circle"
              size="small"
              title="撤回消息"
              type="text"
              onClick={confirmRecallMessage}
              onTouchStart={event => {
                event.stopPropagation();
              }} />
          )}

          <div
            className={`flow-message-bubble ${isMine ? "is-mine" : ""} ${message.status === "failed" ? "is-failed" : ""} ${canRecallMessage ? "is-recallable" : ""}`}
            role={canRecallMessage ? "button" : undefined}
            tabIndex={canRecallMessage ? 0 : undefined}
            title={canRecallMessage ? "右键撤回消息" : undefined}
            onContextMenu={event => {
              if (!canRecallMessage) {
                return;
              }

              event.preventDefault();
              confirmRecallMessage();
            }}
            onKeyDown={event => {
              if (
                !canRecallMessage ||
                (event.key !== "Enter" && event.key !== " " && event.key !== "Delete" && event.key !== "Backspace")
              ) {
                return;
              }

              event.preventDefault();
              confirmRecallMessage();
            }}>
            {renderMessageContent(message)}
          </div>

          {isMine && (
            <span className="flow-message-mobile-avatar">
              {renderMessageAvatar()}
            </span>
          )}
        </div>

        {message.status === "failed" && (
          <Button
            danger
            icon={<ReloadOutlined />}
            size="small"
            type="text"
            onClick={() => {
              return void actions.handleRetryMessage(message);
            }}>
            重试
          </Button>
        )}
      </div>

      {isMine && renderMessageAvatar()}
    </div>
  );
}

export { MessageRow };
