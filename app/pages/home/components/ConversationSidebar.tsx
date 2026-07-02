import {
  LogoutOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Layout,
  List,
  Space,
  Spin,
  Tag,
  Tooltip,
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
  getConversationTitle,
  getUserName,
  readMessageText
} from "../utils";

const {
  Sider
} = Layout;

const {
  Text,
  Title
} = Typography;

interface IConversationSidebarProps {
  viewModel: IHomeWorkbenchViewModel;
}

function ConversationSidebar({
  viewModel
}: IConversationSidebarProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  return (
    <Sider
      breakpoint="lg"
      className="border-r border-[#dadde1] bg-white"
      collapsedWidth={0}
      width={336}>
      <div className="flex h-full flex-col">
        <header className="border-b border-[#dadde1] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Title
                className="!mb-0 !text-2xl !font-bold !text-[#1877f2]"
                level={1}>
                Flow Talk
              </Title>

              <Text className="text-[#65676b]">
                {getUserName(state.currentUser)}
              </Text>
            </div>

            <Tooltip title="退出登录">
              <Button
                className="border-none bg-[#f0f2f5]"
                icon={<LogoutOutlined />}
                shape="circle"
                onClick={actions.handleLogout} />
            </Tooltip>
          </div>

          {/* Facebook 类产品的高频动作通常放在列表上方，降低创建会话的寻找成本。 */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              className="font-semibold"
              icon={<UserAddOutlined />}
              onClick={() => actions.setDirectModalOpen(true)}>
              单聊
            </Button>

            <Button
              className="font-semibold"
              icon={<TeamOutlined />}
              onClick={() => actions.setGroupModalOpen(true)}>
              群聊
            </Button>
          </div>
        </header>

        <div className="flex items-center justify-between px-5 py-3">
          <Text strong>
            会话
          </Text>

          <Space>
            <Tag color={state.wsStatus === "open" ? "green" : "default"}>
              {state.wsStatus === "open" ? "实时在线" : "实时未连接"}
            </Tag>

            <Tooltip title="刷新">
              <Button
                icon={<ReloadOutlined />}
                size="small"
                onClick={() => void actions.handleRefresh()} />
            </Tooltip>
          </Space>
        </div>

        <Spin spinning={state.loading}>
          <List
            className="overflow-y-auto"
            dataSource={state.conversations}
            locale={{
              emptyText: <Empty description="暂无会话" />
            }}
            renderItem={conversation => {
              const selected = conversation.id === state.activeConversationId;

              return (
                <List.Item
                  className={`cursor-pointer !border-b-0 px-4 py-2 transition ${selected ? "!bg-[#e7f3ff]" : "hover:!bg-[#f0f2f5]"}`}
                  onClick={() => actions.handleSelectConversation(conversation.id)}>
                  <List.Item.Meta
                    avatar={(
                      <Badge
                        count={conversation.unread_count || 0}
                        size="small">
                        <Avatar
                          className="bg-[#1877f2]"
                          size={44}
                          src={conversation.avatar_url}>
                          {getConversationTitle(conversation).slice(0, 1)}
                        </Avatar>
                      </Badge>
                    )}
                    description={(
                      <Text
                        className="text-[#65676b]"
                        ellipsis>
                        {conversation.last_message ? readMessageText(conversation.last_message) : "还没有消息"}
                      </Text>
                    )}
                    title={(
                      <div className="flex items-center justify-between gap-3">
                        <Text
                          className="min-w-0"
                          strong
                          ellipsis>
                          {getConversationTitle(conversation)}
                        </Text>

                        <Text className="shrink-0 text-xs text-[#8a8d91]">
                          {formatDateTime(conversation.last_message_at)}
                        </Text>
                      </div>
                    )} />
                </List.Item>
              );
            }} />
        </Spin>
      </div>
    </Sider>
  );
}

export {
  ConversationSidebar
};
