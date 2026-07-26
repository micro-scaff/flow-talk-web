import {
  LogoutOutlined,
  MessageOutlined,
  MoonOutlined,
  ReloadOutlined,
  SearchOutlined,
  SunOutlined,
  TeamOutlined
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
  getConversationDisplayTitle,
  getDirectConversationPeer,
  getDirectConversationPeerId,
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

function formatConversationTime(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();

  const isToday = date.toDateString() === today.toDateString();

  return isToday ? date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  }) : date.toLocaleDateString("zh-CN", {
    day: "2-digit",
    month: "2-digit"
  });
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

  const recentConversations = useMemo(() => {
    return sortCopy(state.conversations, (source, target) => {
      const sourceTime = new Date(source.last_message_at || 0).getTime();

      const targetTime = new Date(target.last_message_at || 0).getTime();

      return targetTime - sourceTime;
    }).
        slice(0, 6);
  }, [
    state.conversations
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

  const visibleRecentConversations = useMemo(() => {
    if (!normalizedKeyword) {
      return recentConversations;
    }

    return recentConversations.filter(conversation => {
      const title = getConversationDisplayTitle(conversation, state.currentUser?.id, state.users);

      const preview = conversation.last_message ? readMessageText(conversation.last_message) : "";

      return `${title} ${preview}`.toLocaleLowerCase("zh-CN").includes(normalizedKeyword);
    });
  }, [
    normalizedKeyword,
    recentConversations,
    state.currentUser?.id,
    state.users
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
      className="flow-sidebar border-r border-[#d9dee8] bg-white"
      theme="light"
      width={360}>
      <div className="flow-sidebar-shell">
        <header className="flow-sidebar-header">
          <div className="flow-brand-row">
            <div
              aria-label="返回工作台首页"
              className="flow-brand-lockup flow-brand-button"
              role="button"
              tabIndex={0}
              title="返回工作台首页"
              onClick={actions.handleBackToContactList}
              onKeyDown={event => {
                if (event.key !== "Enter" && event.key !== " ") {
                  return;
                }

                event.preventDefault();
                actions.handleBackToContactList();
              }}>
              <div className="flow-brand-mark">FT</div>

              <div className="min-w-0">
                <Title
                  className="flow-brand-title !mb-0 !text-[20px] !font-black !leading-none"
                  level={1}>
                  Flow Talk
                </Title>

                <Text
                  className="flow-muted-text mt-1 block max-w-48 text-sm font-semibold"
                  ellipsis>
                  即时协作空间
                </Text>
              </div>
            </div>

            <Space size={4}>
              <Tooltip title={isDark ? "切换到白天模式" : "切换到黑夜模式"}>
                <Button
                  aria-label={isDark ? "切换到白天模式" : "切换到黑夜模式"}
                  className="flow-icon-button"
                  icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                  shape="circle"
                  onClick={toggleTheme} />
              </Tooltip>

              <Tooltip title="刷新会话和联系人">
                <Button
                  aria-label="刷新会话和联系人"
                  className="flow-icon-button"
                  icon={<ReloadOutlined />}
                  shape="circle"
                  onClick={() => {
                    void actions.handleRefresh();
                  }} />
              </Tooltip>

              <Tooltip title="退出登录">
                <Button
                  aria-label="退出登录"
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
                {`${contacts.length} 位联系人 · ${onlineContactCount} 人在线${totalUnreadCount > 0 ? ` · ${totalUnreadCount} 条未读` : ""}`}
              </span>
            </div>
          </div>

          <Input
            allowClear
            aria-label="搜索会话或联系人"
            className="flow-search-input"
            prefix={<SearchOutlined />}
            placeholder="搜索会话或联系人"
            value={keyword}
            onChange={event => {
              setKeyword(event.target.value);
            }} />
        </header>

        <Spin
          className="min-h-0 flex-1"
          spinning={state.loading}>
          <div className="flow-sidebar-list-scroll">
            {visibleRecentConversations.length > 0 && (
              <section aria-labelledby="recent-conversations-heading">
                <div className="flow-list-title is-compact">
                  <div>
                    <Text className="flow-list-eyebrow">RECENT</Text>

                    <Text
                      className="text-base font-black"
                      id="recent-conversations-heading">
                      最近会话
                    </Text>
                  </div>

                  <Tag className="m-0 rounded-full px-2 font-bold">
                    {visibleRecentConversations.length}
                  </Tag>
                </div>

                <div className="flow-recent-list">
                  {visibleRecentConversations.map(conversation => {
                    const peer = conversation.type === "direct" ? getDirectConversationPeer(conversation, state.currentUser?.id, state.users) : undefined;

                    const title = getConversationDisplayTitle(conversation, state.currentUser?.id, state.users);

                    const preview = conversation.last_message ? readMessageText(conversation.last_message) : "还没有消息";

                    const active = conversation.id === state.activeConversationId;

                    return (
                      <button
                        aria-current={active ? "page" : undefined}
                        className={`flow-recent-row ${active ? "is-active" : ""}`}
                        key={conversation.id}
                        type="button"
                        onClick={() => {
                          actions.handleSelectConversation(conversation.id);
                        }}>
                        <Badge
                          count={conversation.unread_count || 0}
                          offset={[
                            -2,
                            2
                          ]}
                          overflowCount={99}
                          size="small">
                          <Avatar
                            size={40}
                            src={(peer?.avatar_url || conversation.avatar_url) || undefined}>
                            {conversation.type === "group" ? <TeamOutlined /> : title.slice(0, 1)}
                          </Avatar>
                        </Badge>

                        <span className="flow-contact-copy">
                          <span className="flow-contact-heading">
                            <Text
                              className="min-w-0"
                              strong
                              ellipsis>
                              {title}
                            </Text>

                            <time>
                              {formatConversationTime(conversation.last_message_at)}
                            </time>
                          </span>

                          <Text
                            className="flow-muted-text"
                            ellipsis>
                            {preview}
                          </Text>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

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

                <Tag className="m-0 rounded-full px-2 font-bold">
                  {visibleContacts.length}
                </Tag>
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
                            color={isOnline ? "#ff5c35" : "#a8a39a"}
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
                            {isOpening ? "正在打开会话…" : getContactDescription(userId, user.username)}
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
                    {normalizedKeyword ? "请尝试姓名、账号或消息内容" : "等待新用户加入"}
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
