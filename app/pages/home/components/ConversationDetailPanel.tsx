import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Select,
  Space,
  Tag,
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
  getConversationDisplayTitle,
  getUserName
} from "../utils";

const {
  Text
} = Typography;

interface IConversationDetailPanelProps {
  viewModel: IHomeWorkbenchViewModel;
}

function ConversationDetailPanel({
  viewModel
}: IConversationDetailPanelProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  // 前端权限展示严格跟随后端 owner/admin/member 矩阵，减少无权限操作产生的无效请求。
  const currentMember = state.activeConversation?.members?.find(member => {
    return member.user_id === state.currentUser?.id && member.status === "active";
  });

  const canManageGroup = currentMember?.role === "owner" || currentMember?.role === "admin";

  const canChangeMemberRole = currentMember?.role === "owner";

  const detailTitle = state.activeConversation ? getConversationDisplayTitle(state.activeConversation, state.currentUser?.id, state.users) : state.activeTitle;

  const activeConversationSummary = state.conversations.find(conversation => {
    return conversation.id === state.activeConversationId;
  });

  const lastMessageAt = activeConversationSummary?.last_message_at || state.activeConversation?.last_message_at;

  return (
    <aside className="flow-conversation-detail border-l border-[#dadde1] bg-white p-5">
      <Space
        className="w-full"
        orientation="vertical"
        size={16}>
        <Card
          className="!rounded-lg"
          size="small"
          title="会话信息">
          {state.activeConversation ? (
            <Space
              className="w-full"
              orientation="vertical">
              <Avatar
                className="bg-[#1877f2]"
                size={56}
                src={state.activeConversation.avatar_url || undefined}>
                {detailTitle.slice(0, 1)}
              </Avatar>

              <Text strong>
                {detailTitle}
              </Text>

              <Text className="text-[#65676b]">
                类型：
                {state.activeConversation.type === "group" ? "群聊" : "单聊"}
              </Text>

              <Text className="text-[#65676b]">
                最后消息：
                {formatDateTime(lastMessageAt)}
              </Text>

              {state.activeConversation.type === "group" && (
                <Space
                  className="w-full"
                  orientation="vertical">
                  <Button
                    block
                    disabled={!canManageGroup}
                    onClick={actions.handleOpenGroupProfile}>
                    {canManageGroup ? "编辑群资料" : "仅群主或管理员可编辑"}
                  </Button>

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

        <Card
          className="!rounded-lg"
          size="small"
          title="成员">
          <Space
            className="w-full"
            orientation="vertical">
            {state.activeConversation?.members?.map(member => {
              const user = state.users.find(item => {
                return item.id === member.user_id;
              });

              const presence = state.presences[member.user_id];

              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 hover:bg-[#f0f2f5]">
                  <Space>
                    <Badge
                      color={presence?.online ? "green" : "default"}
                      dot>
                      <Avatar
                        className="bg-[#e7f3ff] text-[#1877f2]"
                        size={28}>
                        {getUserName(user).slice(0, 1)}
                      </Avatar>
                    </Badge>

                    <div>
                      <Text className="block">
                        {getUserName(user)}
                      </Text>

                      <Text className="text-xs text-[#8a8d91]">
                        {member.role}
                      </Text>
                    </div>
                  </Space>

                  <Tag color={member.status === "active" ? "green" : "default"}>
                    {member.status}
                  </Tag>

                  {state.activeConversation?.type === "group" && member.status === "active" && member.user_id !== state.currentUser?.id && canManageGroup && member.role !== "owner" && (
                    <Space>
                      {canChangeMemberRole && (
                        <Select
                          size="small"
                          value={member.role}
                          options={[
                            {
                              label: "管理员",
                              value: "admin"
                            },
                            {
                              label: "成员",
                              value: "member"
                            }
                          ]}
                          onChange={role => {
                            return void actions.handleUpdateMemberRole(member.user_id, role);
                          }} />
                      )}

                      {(currentMember?.role === "owner" || member.role === "member") && (
                        <Button
                          danger
                          size="small"
                          type="text"
                          onClick={() => {
                            return void actions.handleRemoveMember(member.user_id);
                          }}>
                          移除
                        </Button>
                      )}
                    </Space>
                  )}
                </div>
              );
            })}

            {!state.activeConversation?.members?.length && (
              <Empty description="暂无成员信息" />
            )}
          </Space>
        </Card>
      </Space>
    </aside>
  );
}

export { ConversationDetailPanel };
