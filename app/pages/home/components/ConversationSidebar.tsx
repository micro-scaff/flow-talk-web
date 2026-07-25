import {
  CloseOutlined,
  LogoutOutlined,
  MessageOutlined,
  MoonOutlined,
  ReloadOutlined,
  SearchOutlined,
  SunOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Input,
  Layout,
  Space,
  Spin,
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

import {
  useThemeHook
} from "~/hooks/use-theme-hook";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  getUserName
} from "../utils";

const {
  Sider
} = Layout;

const {
  Text,
  Title
} = Typography;

interface IConversationSidebarProps {
  isMobileOpen: boolean;
  viewModel: IHomeWorkbenchViewModel;
  onMobileClose: () => void;
}

function ConversationSidebar({
  isMobileOpen,
  viewModel,
  onMobileClose
}: IConversationSidebarProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const {
    isDark,
    toggleTheme
  } = useThemeHook();

  const [
    keyword,
    setKeyword
  ] = useState("");

  const contacts = state.users.filter(user => {
    return Boolean(user.id) && user.id !== state.currentUser?.id;
  });

  const visibleContacts = contacts.filter(user => {
    const matchesKeyword = !keyword.trim() || getUserName(user).toLowerCase().includes(keyword.trim().toLowerCase()) || user.username?.toLowerCase().includes(keyword.trim().toLowerCase());

    return matchesKeyword;
  });

  const onlineContactCount = contacts.filter(user => {
    return state.presences[user.id as number]?.online;
  }).length;

  const currentUserName = getUserName(state.currentUser);

  const activeDirectUserId = state.activeConversation?.type === "direct" ? state.activeConversation.members?.find(member => {
    return member.status === "active" && member.user_id !== state.currentUser?.id;
  })?.user_id : undefined;

  function getContactStatus(userId: number): string {
    return state.presences[userId]?.online ? "在线" : "离线";
  }

  function getContactDescription(userId: number, username?: string): string {
    return [
      username ? `@${username}` : "",
      getContactStatus(userId)
    ].filter(Boolean).join(" · ");
  }

  return (
    <Sider
      className={`flow-sidebar ${isMobileOpen ? "is-mobile-open" : ""} border-r border-[#d9dee8] bg-white`}
      theme="light"
      width={360}>
      <div className="flow-sidebar-shell">
        {/* 顶部区域放全局工具：主题、刷新、退出，以及当前登录用户信息。 */}
        <header className="flow-sidebar-header">
          <div className="flow-brand-row">
            <div className="flow-brand-lockup">
              <div className="flow-brand-mark">
                FT
              </div>

              <div className="min-w-0">
                <Title
                  className="flow-brand-title !mb-0 !text-[20px] !font-black !leading-none"
                  level={1}>
                  Flow Talk
                </Title>

                <Text
                  className="flow-muted-text mt-1 block max-w-48 text-sm font-semibold"
                  ellipsis>
                  Talk workspace
                </Text>
              </div>
            </div>

            <Space size={6}>
              <Tooltip title="关闭联系人栏">
                <Button
                  aria-label="关闭联系人栏"
                  className="flow-icon-button flow-mobile-sidebar-close"
                  icon={<CloseOutlined />}
                  shape="circle"
                  onClick={onMobileClose} />
              </Tooltip>

              <Tooltip title={isDark ? "切换到白天模式" : "切换到黑夜模式"}>
                <Button
                  aria-label={isDark ? "切换到白天模式" : "切换到黑夜模式"}
                  className="flow-icon-button"
                  icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                  shape="circle"
                  onClick={toggleTheme} />
              </Tooltip>

              <Tooltip title="刷新">
                <Button
                  className="flow-icon-button"
                  icon={<ReloadOutlined />}
                  shape="circle"
                  onClick={() => {
                    void actions.handleRefresh();
                  }} />
              </Tooltip>

              <Tooltip title="退出登录">
                <Button
                  className="flow-icon-button"
                  icon={<LogoutOutlined />}
                  shape="circle"
                  onClick={actions.handleLogout} />
              </Tooltip>
            </Space>
          </div>

          <div className="flow-user-card">
            <Avatar
              className="flow-user-avatar"
              size={42}
              src={state.currentUser?.avatar_url || undefined}>
              {currentUserName.slice(0, 1)}
            </Avatar>

            <div className="min-w-0">
              <Text
                className="block font-black"
                ellipsis>
                {currentUserName}
              </Text>

              <Text
                className="flow-muted-text block text-xs"
                ellipsis>
                {state.currentUser?.username ? `@${state.currentUser.username}` : `ID ${state.currentUser?.id || "-"}`}
              </Text>
            </div>
          </div>

          <div className="flow-sidebar-status">
            <div className="flow-online-summary">
              <span className="flow-status-dot" />

              <span>
                {`${contacts.length} 位联系人 · ${onlineContactCount} 人在线`}
              </span>
            </div>
          </div>

          <Input
            allowClear
            className="flow-search-input"
            prefix={<SearchOutlined />}
            placeholder="搜索全部用户"
            value={keyword}
            onChange={event => {
              setKeyword(event.target.value);
            }} />
        </header>

        <div className="flow-list-title">
          <div>
            <Text className="text-base font-black">
              全部用户
            </Text>
          </div>

          <Tag
            className="m-0 rounded-full px-2 font-bold"
            color="blue">
            {visibleContacts.length}
          </Tag>
        </div>

        <Spin
          className="min-h-0 flex-1"
          spinning={state.loading}>
          {visibleContacts.length > 0 ? (
            <div className="flow-contact-list">
              {visibleContacts.map(user => {
                const userId = user.id as number;

                const isOnline = Boolean(state.presences[userId]?.online);

                const active = activeDirectUserId === userId;

                return (

                // 点击联系人直接打开单聊；当前单聊联系人保持高亮。
                  <button
                    aria-current={active ? "true" : undefined}
                    className={`flow-contact-row ${active ? "is-active" : ""}`}
                    key={userId}
                    type="button"
                    onClick={() => {
                      void actions.handleCreateDirectWithUser(userId);
                      onMobileClose();
                    }}>
                    <Badge
                      color={isOnline ? "#31a24c" : "#a8b0ba"}
                      dot
                      offset={[
                        -4,
                        36
                      ]}>
                      <Avatar
                        className="bg-[#e7f3ff] font-bold text-[#1877f2]"
                        size={42}
                        src={user.avatar_url || undefined}>
                        {getUserName(user).slice(0, 1)}
                      </Avatar>
                    </Badge>

                    <span className="flow-contact-copy">
                      <span className="flow-contact-heading">
                        <Text
                          className="min-w-0"
                          strong
                          ellipsis>
                          {getUserName(user)}
                        </Text>

                        {active && (
                          <Tag
                            className="m-0 rounded-full px-2 font-bold"
                            color="blue">
                            聊天中
                          </Tag>
                        )}
                      </span>

                      <Text
                        className="flow-muted-text"
                        ellipsis>
                        {getContactDescription(userId, user.username)}
                      </Text>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flow-contact-empty">
              <div className="flow-empty-avatar">
                <MessageOutlined />
              </div>

              <Text className="text-sm font-bold">
                {keyword.trim() ? "未找到匹配用户" : "暂无其他用户"}
              </Text>

              <Text className="flow-muted-text mt-1 text-xs">
                {keyword.trim() ? "请尝试其他关键词" : "等待新用户加入"}
              </Text>
            </div>
          )}
        </Spin>
      </div>
    </Sider>
  );
}

export { ConversationSidebar };
