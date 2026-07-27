import {
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
  ConversationMemberRow
} from "./ConversationMemberRow";
import {
  groupMemberViewItems
} from "./member-model";

const {
  Text
} = Typography;

interface IConversationMemberListProps {
  canManageGroup: boolean;
  currentMember?: IDataConversationMember;
  viewModel: IHomeWorkbenchViewModel;
}

function ConversationMemberList({
  canManageGroup,
  currentMember,
  viewModel
}: IConversationMemberListProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const memberViewItems = (state.activeConversation?.members || []).map(member => {
    return {
      member,
      presence: state.presences[member.user_id],
      user: state.users.find(item => {
        return item.id === member.user_id;
      })
    };
  });

  const activeMemberViewItems = memberViewItems.filter(item => {
    return item.member.status === "active";
  });

  const onlineMemberCount = activeMemberViewItems.filter(item => {
    return item.presence?.online;
  }).length;

  const groupedMembers = groupMemberViewItems(memberViewItems);

  return (
    <Card
      className="flow-members-card !rounded-lg"
      size="small"
      title={(
        <div className="flow-member-card-title">
          <Text strong>
            成员
          </Text>

          <Text className="flow-member-summary">
            {activeMemberViewItems.length}
            {" "}
            位成员 ·
            {" "}
            {onlineMemberCount}
            {" "}
            人在线
          </Text>
        </div>
      )}>
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

                <Text className="flow-member-section-count">
                  {section.members.length}
                </Text>
              </div>

              <Space
                className="w-full"
                orientation="vertical"
                size={6}>
                {section.members.map(item => {
                  return (
                    <ConversationMemberRow
                      actions={actions}
                      canManageGroup={canManageGroup}
                      currentMember={currentMember}
                      currentUserId={state.currentUser?.id}
                      isGroup={state.activeConversation?.type === "group"}
                      item={item}
                      key={item.member.user_id} />
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
  );
}

export { ConversationMemberList };
