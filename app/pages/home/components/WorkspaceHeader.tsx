import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
  LaptopOutlined,
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
  memo,
  useState
} from "react";

import type {
  IDataConversation,
  IDataConversationListItem,
  IDataPresence
} from "~/api";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  getConversationDisplayTitle,
  getDirectConversationPeer,
  getDirectConversationPeerId
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

type THeaderConversation = IDataConversation | IDataConversationListItem | null;

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

function readHeaderConversation(viewModel: IHomeWorkbenchViewModel): THeaderConversation {
  const {
    state
  } = viewModel;

  if (!state.activeConversationId) {
    return null;
  }

  return state.conversations.find(conversation => {
    return conversation.id === state.activeConversationId;
  }) || state.activeConversation;
}

function readPresenceSignature(presences: Record<number, IDataPresence>, conversation: THeaderConversation, currentUserId?: number): string {
  if (!conversation) {
    return "";
  }

  const userIds = conversation.type === "direct"
    ? [
      getDirectConversationPeerId(conversation, currentUserId)
    ]
    : conversation.members?.map(member => {
      return member.user_id;
    }) || [];

  return userIds.
      filter((userId): userId is number => {
        return Boolean(userId);
      }).
      map(userId => {
        const presence = presences[userId];

        return [
          userId,
          presence?.online ? 1 : 0,
          presence?.revision || 0
        ].join(":");
      }).
      join("|");
}

function readHeaderSignature(viewModel: IHomeWorkbenchViewModel): string {
  const {
    state
  } = viewModel;

  const conversation = readHeaderConversation(viewModel);

  const usersSignature = state.users.map(user => {
    return [
      user.id || "",
      user.nickname || "",
      user.username || "",
      user.avatar_url || ""
    ].join(":");
  }).join("|");

  return [
    state.activeConversationId || "",
    conversation?.id || "",
    conversation?.type || "",
    conversation?.title || "",
    conversation?.avatar_url || "",
    conversation?.direct_key || "",
    conversation?.member_count || "",
    conversation?.members?.map(member => {
      return `${member.user_id}:${member.role}:${member.status}`;
    }).join(",") || "",
    state.currentUser?.id || "",
    state.searchText,
    state.wsStatus,
    usersSignature,
    readPresenceSignature(state.presences, conversation, state.currentUser?.id)
  ].join("||");
}

function WorkspaceHeader({
  viewModel
}: IWorkspaceHeaderProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const [
    mobileSearchOpen
  ] = useState(false);

  const hasActiveConversation = Boolean(state.activeConversationId);

  const headerConversation = readHeaderConversation(viewModel);

  const isDirectConversation = headerConversation?.type === "direct";

  const directUser = headerConversation && isDirectConversation ? getDirectConversationPeer(headerConversation, state.currentUser?.id, state.users) : undefined;

  const directPresence = directUser?.id ? state.presences[directUser.id] : undefined;

  const headerTitle = headerConversation ? getConversationDisplayTitle(headerConversation, state.currentUser?.id, state.users) : state.activeTitle;

  const headerAvatar = isDirectConversation ? directUser?.avatar_url : headerConversation?.avatar_url;

  const groupMemberCount = headerConversation?.member_count || headerConversation?.members?.length || 0;

  const groupOnlineCount = headerConversation?.members?.filter(member => {
    return member.status === "active" && state.presences[member.user_id]?.online;
  }).length || 0;

  const connectionLabel = connectionLabels[state.wsStatus];

  const connectionColor = connectionColors[state.wsStatus];

  let headerDescription = `${groupMemberCount} 位成员`;

  if (isDirectConversation) {
    headerDescription = directPresence?.online ? "在线" : "离线";
  } else if (headerConversation?.members?.length) {
    headerDescription = `${groupMemberCount} 位成员 · ${groupOnlineCount} 人在线`;
  }

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

                {headerConversation?.type === "group" && (
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

const MemoizedWorkspaceHeader = memo(WorkspaceHeader, (previousProps, nextProps) => {
  return readHeaderSignature(previousProps.viewModel) === readHeaderSignature(nextProps.viewModel);
});

export { MemoizedWorkspaceHeader as WorkspaceHeader };
