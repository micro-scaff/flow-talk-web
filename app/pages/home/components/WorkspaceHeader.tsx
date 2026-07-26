import {
  ArrowLeftOutlined,
  LaptopOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Input,
  Space,
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
  getUserName
} from "../utils";

const {
  Text,
  Title
} = Typography;

interface IWorkspaceHeaderProps {
  viewModel: IHomeWorkbenchViewModel;
}

function WorkspaceHeader({
  viewModel
}: IWorkspaceHeaderProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const hasActiveConversation = Boolean(state.activeConversationId);

  const isDirectConversation = state.activeConversation?.type === "direct";

  const directMember = isDirectConversation ? state.activeConversation?.members?.find(member => {
    return member.status === "active" && member.user_id !== state.currentUser?.id;
  }) : undefined;

  const directUser = directMember ? state.users.find(user => {
    return user.id === directMember.user_id;
  }) : undefined;

  const directPresence = directMember ? state.presences[directMember.user_id] : undefined;

  const headerTitle = isDirectConversation ? getUserName(directUser || (directMember ? {
    id: directMember.user_id
  } : null)) : state.activeTitle;

  const headerAvatar = isDirectConversation ? directUser?.avatar_url : state.activeConversation?.avatar_url;

  const headerDescription = isDirectConversation ? (directPresence?.online ? "在线" : "离线") : `${state.onlineCount} 位在线`;

  return (
    <header className={`flow-topbar ${hasActiveConversation ? "" : "is-welcome"}`}>
      {/* 只有用户明确选择会话后才展示会话信息，首页保持未打开状态。 */}
      <div className="flow-topbar-title flex min-w-0 items-center gap-3">
        <Button
          aria-label="返回用户列表"
          className="flow-icon-button flow-mobile-menu-button"
          icon={<ArrowLeftOutlined />}
          shape="circle"
          onClick={actions.handleBackToContactList} />

        {hasActiveConversation && (
          <>
            <Avatar
              className="flow-active-avatar shrink-0 bg-[#e7f3ff] text-[#1877f2]"
              size={40}
              src={headerAvatar || undefined}>
              {headerTitle.slice(0, 1)}
            </Avatar>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Title
                  className="!mb-0 !text-lg !font-black"
                  level={2}>
                  {headerTitle}
                </Title>

                {state.activeConversation?.type === "group" && (
                  <Tag color="blue">
                    {state.activeConversation.member_count || state.activeConversation.members?.length || 0}
                    {" "}
                    人
                  </Tag>
                )}
              </div>

              <Text className="flow-active-status mt-1 block">
                {isDirectConversation && (
                  <span className={`flow-active-status-dot ${directPresence?.online ? "is-online" : ""}`} />
                )}

                {headerDescription}
              </Text>
            </div>
          </>
        )}
      </div>

      <Space className="flow-topbar-actions">
        <Tooltip title="创建群聊并选择成员">
          <Button
            className="flow-topbar-action"
            icon={<TeamOutlined />}
            type="primary"
            onClick={actions.handleOpenGroupCreate}>
            创建群聊
          </Button>
        </Tooltip>

        {hasActiveConversation && (
          <Input
            allowClear
            className="flow-search-input flow-message-search"
            prefix={<SearchOutlined />}
            placeholder="搜索消息"
            value={state.searchText}
            onChange={event => {
              return actions.setSearchText(event.target.value);
            }}
            onPressEnter={() => {
              void actions.handleSearch();
            }} />
        )}

        <Tooltip title="设备管理">
          <Button
            className="flow-icon-button"
            icon={<LaptopOutlined />}
            shape="circle"
            onClick={() => {
              return actions.setDevicesOpen(true);
            }} />
        </Tooltip>

        {state.activeConversation?.type === "group" && (
          <Tooltip title="添加群成员">
            <Button
              className="flow-icon-button"
              icon={<PlusOutlined />}
              shape="circle"
              onClick={() => {
                return actions.setMemberModalOpen(true);
              }} />
          </Tooltip>
        )}
      </Space>
    </header>
  );
}

export { WorkspaceHeader };
