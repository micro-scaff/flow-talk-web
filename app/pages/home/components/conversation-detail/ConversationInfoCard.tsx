import {
  Avatar,
  Button,
  Card,
  Empty,
  Space,
  Typography
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IDataConversationMember
} from "~/api";

import type {
  IHomeWorkbenchViewModel
} from "../../type";
import {
  formatDateTime
} from "../../utils";

const {
  Text
} = Typography;

interface IConversationInfoCardProps {
  canManageGroup: boolean;
  currentMember?: IDataConversationMember;
  detailTitle: string;
  lastMessageAt?: string;
  viewModel: IHomeWorkbenchViewModel;
}

function ConversationInfoCard({
  canManageGroup,
  currentMember,
  detailTitle,
  lastMessageAt,
  viewModel
}: IConversationInfoCardProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const conversation = state.activeConversation;

  return (
    <Card
      className="!rounded-lg"
      size="small"
      title="会话信息">
      {conversation ? (
        <Space
          className="w-full"
          orientation="vertical">
          <Avatar
            className="bg-[#1877f2]"
            size={56}
            src={conversation.avatar_url || undefined}>
            {detailTitle.slice(0, 1)}
          </Avatar>

          <Text strong>
            {detailTitle}
          </Text>

          <Text className="text-[#65676b]">
            类型：
            {conversation.type === "group" ? "群聊" : "单聊"}
          </Text>

          <Text className="text-[#65676b]">
            最后消息：
            {formatDateTime(lastMessageAt)}
          </Text>

          {conversation.type === "group" && (
            <Space
              className="w-full"
              orientation="vertical">
              <Button
                block
                disabled={!canManageGroup}
                onClick={actions.handleOpenGroupProfile}>
                {canManageGroup ? "编辑群资料" : "仅群主或管理员可编辑"}
              </Button>

              {canManageGroup && (
                <Button
                  block
                  onClick={() => {
                    return actions.setMemberModalOpen(true);
                  }}>
                  添加群成员
                </Button>
              )}

              {currentMember && currentMember.role !== "owner" && (
                <Button
                  block
                  danger
                  onClick={() => {
                    return void actions.handleLeaveGroup();
                  }}>
                  退出群聊
                </Button>
              )}

              {currentMember?.role === "owner" && (
                <Text className="text-xs text-[#8a8d91]">
                  群主暂不能退出群聊，请保留至少一位负责人。
                </Text>
              )}
            </Space>
          )}
        </Space>
      ) : (
        <Empty description="暂无会话" />
      )}
    </Card>
  );
}

export { ConversationInfoCard };
