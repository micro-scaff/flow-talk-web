import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
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
import {
  useState
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

const connectionLabels = {
  closed: "实时已断开",
  connecting: "正在连接",
  error: "连接异常",
  idle: "等待连接",
  open: "实时在线"
} as const;

const connectionColors = {
  closed: "error",
  connecting: "warning",
  error: "error",
  idle: "default",
  open: "success"
} as const;

function WorkspaceHeader({
  viewModel
}: IWorkspaceHeaderProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const [
    mobileSearchOpen,
    setMobileSearchOpen
  ] = useState(false);

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

  const currentGroupMember = state.activeConversation?.members?.find(member => {
    return member.user_id === state.currentUser?.id && member.status === "active";
  });

  const canAddGroupMembers = currentGroupMember?.role === "owner" || currentGroupMember?.role === "admin";

  const connectionLabel = connectionLabels[state.wsStatus];

  const connectionColor = connectionColors[state.wsStatus];

  const headerDescription = isDirectConversation ? (directPresence?.online ? "在线" : "离线") : `${groupMemberCount} 位成员 · ${groupOnlineCount} 人在线`;

  return (
    <header className={`flow-topbar ${hasActiveConversation ? "" : "is-welcome"} ${mobileSearchOpen ? "is-mobile-search-open" : ""}`}>
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
              className="flow-active-avatar shrink-0"
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
            <Text>RUMOR FEED</Text>
            <Title level={2}>流言场</Title>
          </div>
        )}
      </div>

      <Space className="flow-topbar-actions">
        <Tag
          aria-label={`实时连接状态：${connectionLabel}`}
          className={`flow-connection-tag is-${state.wsStatus}`}
          color={connectionColor}>
          {connectionLabel}
        </Tag>

        <Tooltip title="创建群聊并选择成员">
          <Button
            aria-label="创建群聊"
            className="flow-topbar-action flow-create-group-button"
            icon={<TeamOutlined />}
            type="primary"
            onClick={actions.handleOpenGroupCreate}>
            创建群聊
          </Button>
        </Tooltip>

        <Search
          allowClear
          aria-label={hasActiveConversation ? "搜索当前流言" : "搜索全部流言"}
          className="flow-search-input flow-message-search"
          placeholder={hasActiveConversation ? "搜索当前流言" : "搜索全部流言"}
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

        <Tooltip title={mobileSearchOpen ? "收起消息搜索" : "搜索消息"}>
          <Button
            aria-expanded={mobileSearchOpen}
            aria-label={mobileSearchOpen ? "收起消息搜索" : "搜索消息"}
            className="flow-icon-button flow-mobile-search-button"
            icon={<SearchOutlined />}
            shape="circle"
            onClick={() => {
              setMobileSearchOpen(current => {
                return !current;
              });
            }} />
        </Tooltip>

        <Tooltip title="设备管理">
          <Button
            aria-label="管理登录设备"
            className="flow-icon-button flow-device-button"
            icon={<LaptopOutlined />}
            shape="circle"
            onClick={() => {
              return actions.setDevicesOpen(true);
            }} />
        </Tooltip>

        {hasActiveConversation && (
          <Tooltip title="会话详情">
            <Button
              aria-label="查看会话详情"
              className="flow-detail-button flow-icon-button"
              icon={<InfoCircleOutlined />}
              shape="circle"
              onClick={() => {
                return actions.setDetailsOpen(true);
              }} />
          </Tooltip>
        )}

        {state.activeConversation?.type === "group" && canAddGroupMembers && (
          <Tooltip title="添加群成员">
            <Button
              aria-label="添加群成员"
              className="flow-icon-button flow-member-button"
              icon={<PlusOutlined />}
              shape="circle"
              onClick={() => {
                return actions.setMemberModalOpen(true);
              }} />
          </Tooltip>
        )}
      </Space>

      {mobileSearchOpen && (
        <div className="flow-mobile-search-tray">
          <Search
            allowClear
            aria-label={hasActiveConversation ? "移动端搜索当前流言" : "移动端搜索全部流言"}
            autoFocus
            className="flow-search-input"
            enterButton
            placeholder={hasActiveConversation ? "搜索当前会话" : "搜索全部消息"}
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
        </div>
      )}
    </header>
  );
}

export { WorkspaceHeader };
