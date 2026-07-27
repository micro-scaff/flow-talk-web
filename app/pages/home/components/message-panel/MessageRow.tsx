import {
  ReloadOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Typography
} from "antd";
import type {
  ReactElement
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

        <div className={`flow-message-bubble ${isMine ? "is-mine" : ""} ${message.status === "failed" ? "is-failed" : ""}`}>
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
