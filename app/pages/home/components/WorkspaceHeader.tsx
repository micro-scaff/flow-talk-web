import {
  ArrowLeftOutlined,
  LaptopOutlined,
  PlusOutlined,
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
  getConversationDisplayTitle,
  getDirectConversationPeer
} from "../utils";

const {
  Text,
  Title
} = Typography;

const {
  Search
} = Input;

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

  const directUser = state.activeConversation && isDirectConversation ? getDirectConversationPeer(state.activeConversation, state.currentUser?.id, state.users) : undefined;

  const directPresence = directUser?.id ? state.presences[directUser.id] : undefined;

  const headerTitle = state.activeConversation ? getConversationDisplayTitle(state.activeConversation, state.currentUser?.id, state.users) : state.activeTitle;

  const headerAvatar = isDirectConversation ? directUser?.avatar_url : state.activeConversation?.avatar_url;

  const groupMemberCount = state.activeConversation?.member_count || state.activeConversation?.members?.length || 0;

  const groupOnlineCount = state.activeConversation?.members?.filter(member => {
    return member.status === "active" && state.presences[member.user_id]?.online;
  }).length || 0;

  const headerDescription = isDirectConversation ? (directPresence?.online ? "在线" : "离线") : `${groupMemberCount} 位成员 · ${groupOnlineCount} 人在线`;

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
                  <Tag className="flow-conversation-tag">
                    群聊
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

        {!hasActiveConversation && (
          <div className="flow-workspace-heading">
            <Text>WORKSPACE</Text>
            <Title level={2}>消息</Title>
          </div>
        )}
      </div>

      <Space className="flow-topbar-actions">
        <Tooltip title="创建群聊并选择成员">
          <Button
            aria-label="创建群聊"
            className="flow-topbar-action"
            icon={<TeamOutlined />}
            type="primary"
            onClick={actions.handleOpenGroupCreate}>
            创建群聊
          </Button>
        </Tooltip>

        {hasActiveConversation && (
          <Search
            allowClear
            aria-label="搜索当前会话消息"
            className="flow-search-input flow-message-search"
            placeholder="搜索当前会话"
            value={state.searchText}
            onChange={event => {
              const nextValue = event.target.value;

              actions.setSearchText(nextValue);

              if (!nextValue.trim()) {
                actions.setSearchResults([]);
              }
            }}
            onSearch={() => {
              void actions.handleSearch();
            }} />
        )}

        <Tooltip title="设备管理">
          <Button
            aria-label="管理登录设备"
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
              aria-label="添加群成员"
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
