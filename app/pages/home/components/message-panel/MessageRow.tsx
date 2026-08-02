import {
  ReloadOutlined
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

  const recallTouchTimerRef = useRef<number | null>(null);

  const recallConfirmOpenRef = useRef(false);

  const canRecallMessage = isMine && message.id > 0 && message.status === "normal";

  const sender = state.users.find(user => {
    return user.id === message.sender_id;
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

  function clearRecallTouchTimer(): void {
    if (recallTouchTimerRef.current === null) {
      return;
    }

    window.clearTimeout(recallTouchTimerRef.current);
    recallTouchTimerRef.current = null;
  }

  function confirmRecallMessage(): void {
    if (!canRecallMessage || recallConfirmOpenRef.current) {
      return;
    }

    recallConfirmOpenRef.current = true;
    Modal.confirm({
      cancelText: "取消",
      content: "撤回后，这条消息会从聊天记录和搜索结果中隐藏，但数据库仍会保留原始内容。",
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
      {!isMine && messageAvatar}

      <div className={`flow-message-group group ${isMine ? "items-end" : "items-start"} flex flex-col`}>
        <Text className={`flow-message-meta mb-1 text-xs ${message.status === "failed" ? "is-failed" : ""} ${isMine ? "text-right" : ""}`}>
          {messageName}
          {" · "}
          {formatDateTime(message.sent_at)}
          {message.status === "sending" && " · 发送中"}
          {message.status === "failed" && " · 发送失败"}
        </Text>

        <div
          className={`flow-message-bubble ${isMine ? "is-mine" : ""} ${message.status === "failed" ? "is-failed" : ""} ${canRecallMessage ? "is-recallable" : ""}`}
          role={canRecallMessage ? "button" : undefined}
          tabIndex={canRecallMessage ? 0 : undefined}
          title={canRecallMessage ? "右键或长按撤回消息" : undefined}
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
          }}
          onTouchCancel={clearRecallTouchTimer}
          onTouchEnd={clearRecallTouchTimer}
          onTouchMove={clearRecallTouchTimer}
          onTouchStart={() => {
            if (!canRecallMessage) {
              return;
            }

            clearRecallTouchTimer();
            recallTouchTimerRef.current = window.setTimeout(() => {
              recallTouchTimerRef.current = null;
              confirmRecallMessage();
            }, 650);
          }}>
          {renderMessageContent(message)}
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

      {isMine && messageAvatar}
    </div>
  );
}

export { MessageRow };
