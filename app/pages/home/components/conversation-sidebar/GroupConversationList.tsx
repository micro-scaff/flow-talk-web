import {
  TeamOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Typography
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IDataConversationListItem
} from "~/api";

import type {
  IHomeWorkbenchViewModel
} from "../../type";
import {
  getConversationDisplayTitle
} from "../../utils";

const {
  Text
} = Typography;

interface IGroupConversationListProps {
  activeConversationId?: number;
  conversations: IDataConversationListItem[];
  viewModel: IHomeWorkbenchViewModel;
}

function GroupConversationList({
  activeConversationId,
  conversations,
  viewModel
}: IGroupConversationListProps): ReactElement | null {
  const {
    actions,
    state
  } = viewModel;

  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="flow-contact-section">
      <div className="flow-contact-section-heading">
        <Text className="flow-list-eyebrow">GROUPS</Text>

        <Text className="flow-muted-text text-xs">
          {conversations.length}
          {" "}
          个群聊
        </Text>
      </div>

      <div className="flow-contact-list flow-group-chat-list">
        {conversations.map(conversation => {
          const groupTitle = getConversationDisplayTitle(conversation, state.currentUser?.id, state.users);

          const activeMemberCount = conversation.members?.filter(member => {
            return member.status === "active";
          }).length || conversation.member_count || 0;

          const unreadCount = conversation.unread_count || 0;

          return (
            <button
              aria-current={activeConversationId === conversation.id ? "page" : undefined}
              className={`flow-contact-row flow-group-chat-row ${activeConversationId === conversation.id ? "is-active" : ""}`}
              key={conversation.id}
              type="button"
              onClick={() => {
                void actions.handleSelectConversation(conversation.id);
              }}>
              <Badge
                count={unreadCount}
                offset={[
                  -2,
                  2
                ]}
                overflowCount={99}
                size="small">
                <Avatar
                  className="flow-group-chat-avatar"
                  size={42}
                  src={conversation.avatar_url || undefined}>
                  {groupTitle.slice(0, 1)}
                </Avatar>
              </Badge>

              <span className="flow-contact-copy">
                <span className="flow-contact-heading">
                  <Text
                    className="min-w-0"
                    strong
                    ellipsis>
                    {groupTitle}
                  </Text>
                </span>

                <Text
                  className="flow-muted-text"
                  ellipsis>
                  {`${activeMemberCount} 位成员${unreadCount > 0 ? ` · ${unreadCount} 条未读` : ""}`}
                </Text>
              </span>

              <TeamOutlined className="flow-group-chat-icon" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { GroupConversationList };
