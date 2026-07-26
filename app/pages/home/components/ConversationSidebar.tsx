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
  useMemo,
  useState
} from "react";

import type {
  IDataConversationListItem
} from "~/api";
import {
  useThemeHook
} from "~/hooks/use-theme-hook";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  getDirectConversationPeerId,
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

function normalizeSearchValue(value: string): string {
  return value.trim().toLocaleLowerCase("zh-CN");
}

function sortCopy<T>(values: readonly T[], compare: (source: T, target: T) => number): T[] {
  const nextValues = [
    ...values
  ];

  // 当前 tsconfig 目标为 ES2022，复制后排序可避免直接修改接口返回数组。
  // eslint-disable-next-line unicorn/no-array-sort
  return nextValues.sort(compare);
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

  const [
    openingUserId,
    setOpeningUserId
  ] = useState<number | null>(null);

  const normalizedKeyword = normalizeSearchValue(keyword);

  const contacts = useMemo(() => {
    const availableContacts = state.users.filter(user => {
      return Boolean(user.id) && user.id !== state.currentUser?.id;
    });

    return sortCopy(availableContacts, (source, target) => {
      const sourceOnline = Number(Boolean(state.presences[source.id as number]?.online));

      const targetOnline = Number(Boolean(state.presences[target.id as number]?.online));

      if (sourceOnline !== targetOnline) {
        return targetOnline - sourceOnline;
      }

      return getUserName(source).localeCompare(getUserName(target), "zh-CN");
    });
  }, [
    state.currentUser?.id,
    state.presences,
    state.users
  ]);

  const visibleContacts = useMemo(() => {
    if (!normalizedKeyword) {
      return contacts;
    }

    return contacts.filter(user => {
      const searchableText = `${getUserName(user)} ${user.username || ""}`.toLocaleLowerCase("zh-CN");

      return searchableText.includes(normalizedKeyword);
    });
  }, [
    contacts,
    normalizedKeyword
  ]);

  const directConversationByUserId = useMemo(() => {
    const conversationMap = new Map<number, IDataConversationListItem>();

    for (const conversation of state.conversations) {
      if (conversation.type !== "direct") {
        continue;
      }

      const peerUserId = getDirectConversationPeerId(conversation, state.currentUser?.id);

      if (peerUserId) {
        conversationMap.set(peerUserId, conversation);
      }
    }

    return conversationMap;
  }, [
    state.conversations,
    state.currentUser?.id
  ]);

  const onlineContactCount = contacts.filter(user => {
    return state.presences[user.id as number]?.online;
  }).length;

  const totalUnreadCount = state.conversations.reduce((total, conversation) => {
    return total + (conversation.unread_count || 0);
  }, 0);

  const currentUserName = getUserName(state.currentUser);

  const activeDirectUserId = state.activeConversation?.type === "direct" ? getDirectConversationPeerId(state.activeConversation, state.currentUser?.id) : undefined;

  function getContactDescription(userId: number, username?: string): string {
    return [
      username ? `@${username}` : "",
      state.presences[userId]?.online ? "在线" : "离线"
    ].filter(Boolean).join(" · ");
  }

  async function handleOpenContact(userId: number): Promise<void> {
    if (openingUserId !== null) {
      return;
    }

    const existingConversation = directConversationByUserId.get(userId);

    if (existingConversation) {

      // 已有单聊直接导航，避免重复请求创建接口并让常用联系人打开得更快。
      actions.handleSelectConversation(existingConversation.id);

      return;
    }

    setOpeningUserId(userId);

    try {
      await actions.handleCreateDirectWithUser(userId);
    } finally {
      setOpeningUserId(null);
    }
  }

  return (
    <Sider
      className="flow-sidebar"
      theme="light"
      width={360}>
      <div className="flow-sidebar-shell">
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

                <Text
                  className="flow-brand-subtitle flow-muted-text block font-semibold">
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
                {`${contacts.length} 位联系人 · ${onlineContactCount} 人在线${totalUnreadCount > 0 ? ` · ${totalUnreadCount} 条未读` : ""}`}
              </span>
            </div>
          </div>

          <Input
            allowClear
            aria-label="搜索联系人"
            className="flow-search-input"
            prefix={<SearchOutlined />}
            placeholder="搜索联系人"
            value={keyword}
            onChange={event => {
              setKeyword(event.target.value);
            }} />
        </header>

        <Spin
          className="min-h-0 flex-1"
          spinning={state.loading}>
          <div className="flow-sidebar-list-scroll">
            <section aria-labelledby="contacts-heading">
              <div className="flow-list-title is-compact">
                <div>
                  <Text className="flow-list-eyebrow">CONTACTS</Text>

                  <Text
                    className="text-base font-black"
                    id="contacts-heading">
                    全部联系人
                  </Text>
                </div>

                <Space size={4}>
                  <Tag className="m-0 rounded-full px-2 font-bold">
                    {visibleContacts.length}
                  </Tag>

                  <Tooltip title="刷新联系人状态">
                    <Button
                      aria-label="刷新联系人状态"
                      className="flow-contact-refresh flow-icon-button"
                      icon={<ReloadOutlined />}
                      loading={state.loading}
                      shape="circle"
                      size="small"
                      type="text"
                      onClick={() => {
                        void actions.handleRefresh();
                      }} />
                  </Tooltip>
                </Space>
              </div>

              {visibleContacts.length > 0 ? (
                <div className="flow-contact-list">
                  {visibleContacts.map(user => {
                    const userId = user.id as number;

                    const isOnline = Boolean(state.presences[userId]?.online);

                    const active = activeDirectUserId === userId;

                    const unreadCount = directConversationByUserId.get(userId)?.unread_count || 0;

                    const isOpening = openingUserId === userId;

                    return (
                      <button
                        aria-busy={isOpening}
                        aria-current={active ? "page" : undefined}
                        className={`flow-contact-row ${active ? "is-active" : ""}`}
                        disabled={openingUserId !== null}
                        key={userId}
                        type="button"
                        onClick={() => {
                          void handleOpenContact(userId);
                        }}>
                        <Badge
                          count={unreadCount}
                          offset={[
                            -2,
                            2
                          ]}
                          overflowCount={99}
                          size="small">
                          <Badge
                            color={isOnline ? "#c9366f" : "#a89aa3"}
                            dot
                            offset={[
                              -4,
                              36
                            ]}>
                            <Avatar
                              size={42}
                              src={user.avatar_url || undefined}>
                              {getUserName(user).slice(0, 1)}
                            </Avatar>
                          </Badge>
                        </Badge>

                        <span className="flow-contact-copy">
                          <span className="flow-contact-heading">
                            <Text
                              className="min-w-0"
                              strong
                              ellipsis>
                              {getUserName(user)}
                            </Text>
                          </span>

                          <Text
                            className="flow-muted-text"
                            ellipsis>
                            {isOpening ? "正在打开流言…" : getContactDescription(userId, user.username)}
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
                    {normalizedKeyword ? "未找到匹配结果" : "暂无其他联系人"}
                  </Text>

                  <Text className="flow-muted-text mt-1 text-xs">
                    {normalizedKeyword ? "请尝试姓名或账号" : "等待新用户加入"}
                  </Text>
                </div>
              )}
            </section>
          </div>
        </Spin>
      </div>
    </Sider>
  );
}

export { ConversationSidebar };
