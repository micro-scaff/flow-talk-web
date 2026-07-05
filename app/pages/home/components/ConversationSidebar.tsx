import {
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
  viewModel: IHomeWorkbenchViewModel;
}

function ConversationSidebar({
  viewModel
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

  // 侧栏只展示在线联系人；离线用户暂不参与发起会话和群聊选择。
  const onlineUsers = state.users.filter(user => {
    const matchesKeyword = !keyword.trim() || getUserName(user).toLowerCase().includes(keyword.trim().toLowerCase()) || user.username?.toLowerCase().includes(keyword.trim().toLowerCase());

    return Boolean(user.id) && user.id !== state.currentUser?.id && state.presences[user.id as number]?.online && matchesKeyword;
  });

  const currentUserName = getUserName(state.currentUser);

  return (
    <Sider
      className="flow-sidebar border-r border-[#d9dee8] bg-white"
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
              src={state.currentUser?.avatar_url}>
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
                {`${onlineUsers.length} 人在线`}
              </span>
            </div>
          </div>

          <Input
            allowClear
            className="flow-search-input"
            prefix={<SearchOutlined />}
            placeholder="搜索在线人员"
            value={keyword}
            onChange={event => {
              setKeyword(event.target.value);
            }} />
        </header>

        <div className="flow-list-title">
          <div>
            <Text className="text-base font-black">
              在线人员名单
            </Text>
          </div>

          <Tag
            className="m-0 rounded-full px-2 font-bold"
            color="blue">
            {state.selectedGroupUserIds.length}
          </Tag>
        </div>

        <Spin
          className="min-h-0 flex-1"
          spinning={state.loading}>
          <List
            className="flow-contact-list"
            dataSource={onlineUsers}
            locale={{
              emptyText: (
                <div className="flow-contact-empty">
                  <div className="flow-empty-avatar">
                    <MessageOutlined />
                  </div>

                  <Text className="text-sm font-bold">
                    暂无在线联系人
                  </Text>

                  <Text className="flow-muted-text mt-1 text-xs">
                    等待好友上线
                  </Text>
                </div>
              )
            }}
            renderItem={user => {
              const userId = user.id as number;

              const selected = state.selectedGroupUserIds.includes(userId);

              return (

                // 点击整行只负责选择/取消选择；真正创建对话统一交给右上角按钮。
                <List.Item
                  className={`flow-contact-row ${selected ? "is-selected" : ""}`}
                  onClick={() => {
                    actions.toggleSelectedGroupUser(userId);
                  }}>
                  <List.Item.Meta
                    avatar={(
                      <Badge
                        color="#31a24c"
                        dot
                        offset={[
                          -4,
                          36
                        ]}>
                        <Avatar
                          className="bg-[#e7f3ff] font-bold text-[#1877f2]"
                          size={42}>
                          {getUserName(user).slice(0, 1)}
                        </Avatar>
                      </Badge>
                    )}
                    description={(
                      <Text
                        className="flow-muted-text"
                        ellipsis>
                        {user.username ? `@${user.username}` : "在线"}
                      </Text>
                    )}
                    title={(
                      <div className="flex items-center justify-between gap-3">
                        <Text
                          className="min-w-0"
                          strong
                          ellipsis>
                          {getUserName(user)}
                        </Text>

                        {selected && (
                          <Tag
                            className="m-0 rounded-full px-2 font-bold"
                            color="blue">
                            已选
                          </Tag>
                        )}
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

export { ConversationSidebar };
