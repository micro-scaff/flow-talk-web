import {
  LogoutOutlined,
  MoonOutlined,
  SearchOutlined,
  SunOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Input,
  Space,
  Tooltip,
  Typography
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../../type";

const {
  Text,
  Title
} = Typography;

interface ISidebarHeaderProps {
  contactCount: number;
  currentUserName: string;
  isDark: boolean;
  keyword: string;
  onlineContactCount: number;
  setKeyword: (value: string) => void;
  toggleTheme: () => void;
  totalUnreadCount: number;
  viewModel: IHomeWorkbenchViewModel;
}

function SidebarHeader({
  contactCount,
  currentUserName,
  isDark,
  keyword,
  onlineContactCount,
  setKeyword,
  toggleTheme,
  totalUnreadCount,
  viewModel
}: ISidebarHeaderProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  return (
    <header className="flow-sidebar-header">
      <div className="flow-brand-row">
        <div
          aria-label="返回联系人首页"
          className="flow-brand-lockup flow-brand-button"
          role="button"
          tabIndex={0}
          title="返回联系人首页"
          onClick={actions.handleBackToContactList}
          onKeyDown={event => {
            if (event.key !== "Enter" && event.key !== " ") {
              return;
            }

            event.preventDefault();
            actions.handleBackToContactList();
          }}>
          <div className="flow-brand-mark">FT</div>

          <div className="flow-brand-copy">
            <Title
              className="flow-brand-title !mb-0 !font-black"
              level={1}>
              Flow Talk
            </Title>

            <Text className="flow-brand-subtitle flow-muted-text block font-semibold">
              流言正在发生
            </Text>
          </div>
        </div>

        <Space
          className="flow-brand-actions"
          size={3}>
          <Tooltip title={isDark ? "切换到白天模式" : "切换到黑夜模式"}>
            <Button
              aria-label={isDark ? "切换到白天模式" : "切换到黑夜模式"}
              className="flow-icon-button"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              shape="circle"
              onClick={toggleTheme} />
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

        <span className="flow-user-mobile-status">
          <i />
          {onlineContactCount}
          {" "}
          在线
        </span>

        <Tooltip title="退出登录">
          <Button
            aria-label="退出登录"
            className="flow-account-logout flow-icon-button"
            icon={<LogoutOutlined />}
            shape="circle"
            onClick={actions.handleLogout} />
        </Tooltip>
      </div>

      <div className="flow-sidebar-status">
        <div className="flow-online-summary">
          <span className="flow-status-dot" />

          <span>
            {`${contactCount} 位联系人 · ${onlineContactCount} 人在线${totalUnreadCount > 0 ? ` · ${totalUnreadCount} 条未读` : ""}`}
          </span>
        </div>
      </div>

      <Input
        allowClear
        aria-label="搜索联系人或群聊"
        className="flow-search-input"
        prefix={<SearchOutlined />}
        placeholder="搜索联系人或群聊"
        value={keyword}
        onChange={event => {
          setKeyword(event.target.value);
        }} />
    </header>
  );
}

export { SidebarHeader };
