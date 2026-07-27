import {
  Avatar,
  Badge,
  Button,
  Tag,
  Typography
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IDataConversationMember
} from "~/api";

import type {
  IHomeWorkbenchActions
} from "../../type";
import {
  getUserName
} from "../../utils";
import type {
  IMemberViewItem
} from "./member-model";
import {
  getMemberRoleLabel,
  getMemberStatusLabel
} from "./member-model";

const {
  Text
} = Typography;

interface IConversationMemberRowProps {
  actions: IHomeWorkbenchActions;
  canManageGroup: boolean;
  currentMember?: IDataConversationMember;
  currentUserId?: number;
  isGroup: boolean;
  item: IMemberViewItem;
}

function ConversationMemberRow({
  actions,
  canManageGroup,
  currentMember,
  currentUserId,
  isGroup,
  item
}: IConversationMemberRowProps): ReactElement {
  const {
    member,
    presence,
    user
  } = item;

  const memberName = getUserName(user);

  const memberAccount = user?.username ? `@${user.username}` : `ID ${member.user_id}`;

  const isCurrentUser = member.user_id === currentUserId;

  const canChangeMemberRole = currentMember?.role === "owner";

  const canShowMemberActions = isGroup && member.status === "active" && !isCurrentUser && canManageGroup && member.role !== "owner";

  return (
    <div className={`flow-member-row is-${member.role} ${member.status === "active" ? "is-active-member" : "is-inactive-member"} ${isCurrentUser ? "is-current-user" : ""} ${canShowMemberActions ? "has-member-actions" : ""}`}>
      <Badge
        color={presence?.online ? "var(--flow-primary)" : "var(--flow-muted)"}
        dot
        offset={[
          -3,
          35
        ]}>
        <Avatar
          className="flow-member-avatar"
          size={40}
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
          {" · "}
          {memberAccount}
        </Text>
      </div>

      <div className="flow-member-side">
        {member.status === "active" ? (
          <span className={`flow-member-presence ${presence?.online ? "is-online" : ""}`}>
            <i />
            {presence?.online ? "在线" : "离线"}
          </span>
        ) : (
          <Tag className="flow-member-status-tag">
            {getMemberStatusLabel(member.status)}
          </Tag>
        )}
      </div>

      {canShowMemberActions && (
        <div className="flow-member-actions">
          <Text className="flow-member-actions-label">
            {canChangeMemberRole ? "角色" : "成员管理"}
          </Text>

          {canChangeMemberRole && (
            <div
              aria-label={`修改 ${memberName} 的群聊角色`}
              className="flow-member-role-toggle"
              role="group">
              <button
                aria-pressed={member.role === "member"}
                className={member.role === "member" ? "is-selected" : ""}
                type="button"
                onClick={() => {
                  if (member.role !== "member") {
                    void actions.handleUpdateMemberRole(member.user_id, "member");
                  }
                }}>
                成员
              </button>

              <button
                aria-pressed={member.role === "admin"}
                className={member.role === "admin" ? "is-selected" : ""}
                type="button"
                onClick={() => {
                  if (member.role !== "admin") {
                    void actions.handleUpdateMemberRole(member.user_id, "admin");
                  }
                }}>
                管理员
              </button>
            </div>
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
  );
}

export { ConversationMemberRow };
