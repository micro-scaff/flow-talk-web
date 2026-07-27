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
  IDataConversationMember,
  IDataListUsers,
  IDataPresence
} from "~/api";

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

const memberRoleLabels: Record<string, string> = {
  admin: "管理员",
  member: "成员",
  owner: "群主"
};

const memberStatusLabels: Record<string, string> = {
  active: "正常",
  left: "已退出",
  removed: "已移除"
};

const memberSections = [
  {
    key: "owner",
    title: "群主"
  },
  {
    key: "admin",
    title: "管理员"
  },
  {
    key: "member",
    title: "成员"
  },
  {
    key: "inactive",
    title: "已退出 / 已移除"
  }
];

interface IConversationDetailPanelProps {
  viewModel: IHomeWorkbenchViewModel;
}

interface IMemberViewItem {
  member: IDataConversationMember;
  presence?: IDataPresence;
  user?: IDataListUsers[number];
}

function getMemberRoleLabel(role: string): string {
  return memberRoleLabels[role] || role;
}

function getMemberStatusLabel(status: string): string {
  return memberStatusLabels[status] || status;
}

function getMemberSectionKey(member: IDataConversationMember): string {
  if (member.status !== "active") {
    return "inactive";
  }

  if (member.role === "owner" || member.role === "admin") {
    return member.role;
  }

  return "member";
}

function sortMemberViewItems(source: IMemberViewItem, target: IMemberViewItem): number {
  const sourceOnlineRank = source.presence?.online ? 0 : 1;

  const targetOnlineRank = target.presence?.online ? 0 : 1;

  if (sourceOnlineRank !== targetOnlineRank) {
    return sourceOnlineRank - targetOnlineRank;
  }

  const sourceName = getUserName(source.user);

  const targetName = getUserName(target.user);

  const nameCompare = sourceName.localeCompare(targetName, "zh-Hans-CN");

  if (nameCompare !== 0) {
    return nameCompare;
  }

  return source.member.user_id - target.member.user_id;
}

function sortMemberViewItemList(items: IMemberViewItem[]): IMemberViewItem[] {
  return [
    ...items
  // eslint-disable-next-line unicorn/no-array-sort
  ].sort(sortMemberViewItems);
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

  const memberViewItems = (state.activeConversation?.members || []).map(member => {
    return {
      member,
      presence: state.presences[member.user_id],
      user: state.users.find(item => {
        return item.id === member.user_id;
      })
    };
  });

  const groupedMembers = memberSections.map(section => {
    return {
      ...section,
      members: sortMemberViewItemList(memberViewItems.filter(item => {
        return getMemberSectionKey(item.member) === section.key;
      }))
    };
  }).filter(section => {
    return section.members.length > 0;
  });

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

        <Card
          className="!rounded-lg"
          size="small"
          title="成员">
          <Space
            className="flow-member-list w-full"
            orientation="vertical">
            {groupedMembers.map(section => {
              return (
                <div
                  key={section.key}
                  className="flow-member-section">
                  <div className="flow-member-section-title">
                    <Text strong>
                      {section.title}
                    </Text>

                    <Text className="text-xs text-[#8a8d91]">
                      {section.members.length}
                    </Text>
                  </div>

                  <Space
                    className="w-full"
                    orientation="vertical"
                    size={6}>
                    {section.members.map(({
                      member,
                      presence,
                      user
                    }) => {
                      const memberName = getUserName(user);

                      const isCurrentUser = member.user_id === state.currentUser?.id;

                      const canShowMemberActions = state.activeConversation?.type === "group" && member.status === "active" && member.user_id !== state.currentUser?.id && canManageGroup && member.role !== "owner";

                      return (
                        <div
                          key={member.user_id}
                          className={`flow-member-row ${isCurrentUser ? "is-current-user" : ""} ${canShowMemberActions ? "has-member-actions" : ""}`}>
                          <Badge
                            color={presence?.online ? "green" : "default"}
                            dot>
                            <Avatar
                              className="bg-[#e7f3ff] text-[#1877f2]"
                              size={34}
                              src={user?.avatar_url || undefined}>
                              {memberName.slice(0, 1)}
                            </Avatar>
                          </Badge>

                          <div className="flow-member-copy">
                            <div className="flow-member-name-line">
                              <Text
                                className="flow-member-name"
                                title={memberName}>
                                {memberName}
                              </Text>

                              {isCurrentUser && (
                                <Tag className="flow-member-self-tag">
                                  我
                                </Tag>
                              )}
                            </div>

                            <Text className="flow-member-meta">
                              {getMemberRoleLabel(member.role)}
                              {presence?.online ? " · 在线" : " · 离线"}
                            </Text>
                          </div>

                          <div className="flow-member-side">
                            <Tag
                              className="flow-member-status-tag"
                              color={member.status === "active" ? "green" : "default"}>
                              {getMemberStatusLabel(member.status)}
                            </Tag>

                            {canShowMemberActions && (
                              <div className="flow-member-actions">
                                {canChangeMemberRole && (
                                  <Select
                                    className="flow-member-role-select"
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
                                    className="flow-member-remove-button"
                                    size="small"
                                    type="text"
                                    onClick={() => {
                                      return void actions.handleRemoveMember(member.user_id);
                                    }}>
                                    移除
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Space>
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
