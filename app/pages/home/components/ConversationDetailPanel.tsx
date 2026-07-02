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

  return (
    <aside className="hidden border-l border-[#dadde1] bg-white p-5 xl:block">
      <Space
        className="w-full"
        direction="vertical"
        size={16}>
        <Card
          className="!rounded-lg"
          size="small"
          title="会话信息">
          {state.activeConversation ? (
            <Space
              className="w-full"
              direction="vertical">
              <Avatar
                className="bg-[#1877f2]"
                size={56}
                src={state.activeConversation.avatar_url}>
                {state.activeTitle.slice(0, 1)}
              </Avatar>

              <Text strong>
                {state.activeTitle}
              </Text>

              <Text className="text-[#65676b]">
                类型：
                {state.activeConversation.type === "group" ? "群聊" : "单聊"}
              </Text>

              <Text className="text-[#65676b]">
                最后消息：
                {formatDateTime(state.activeConversation.last_message_at)}
              </Text>

              {state.activeConversation.type === "group" && (
                <Space
                  className="w-full"
                  direction="vertical">
                  <Button
                    block
                    onClick={actions.handleOpenGroupProfile}>
                    编辑群资料
                  </Button>

                  <Button
                    block
                    danger
                    onClick={() => {
                      return void actions.handleLeaveGroup();
                    }}>
                    退出群聊
                  </Button>
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
            direction="vertical">
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

                  {state.activeConversation?.type === "group" && member.user_id !== state.currentUser?.id && (
                    <Space>
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

                      <Button
                        danger
                        size="small"
                        type="text"
                        onClick={() => {
                          return void actions.handleRemoveMember(member.user_id);
                        }}>
                        移除
                      </Button>
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
