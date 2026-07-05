import {
  Form,
  message
} from "antd";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  useNavigate,
  useParams
} from "react-router";

import {
  dataAddGroupMembers,
  dataBatchPresence,
  dataConversationDetail,
  dataConversationList,
  dataCreateDirectConversation,
  dataCreateGroupConversation,
  dataDeleteDevice,
  dataDeviceList,
  dataGetCurrentUser,
  dataLeaveGroup,
  dataListUsers,
  dataMarkConversationRead,
  dataMessageList,
  dataMessageSearch,
  dataRemoveGroupMember,
  dataSendMessage,
  dataUpdateGroupProfile,
  dataUpdateMemberRole,
  dataUpsertDevice
} from "~/api";
import type {
  IDataConversation,
  IDataConversationListItem,
  IDataDevice,
  IDataGetCurrentUser,
  IDataListUsers,
  IDataMessage,
  IDataPresence
} from "~/api";
import {
  useWebSocketHook
} from "~/hooks/use-websocket-hook";
import {
  clearSession,
  createClientMessageId,
  getDeviceId,
  getDevicePlatform,
  getSession
} from "~/utils";

import type {
  IAddMemberFormValues,
  IGroupFormValues,
  IGroupProfileFormValues,
  IHomeWorkbenchActions,
  IHomeWorkbenchDialogs,
  IHomeWorkbenchForms,
  IHomeWorkbenchState,
  IHomeWorkbenchViewModel,
  IUserOption
} from "../type";
import {
  getActionErrorMessage,
  getConversationTitle,
  getUserName,
  createLocalSendingMessage,
  isFormValidationError,
  markMessageFailed,
  mergeMessage,
  pickWsMessage,
  replaceSendingMessage,
  shouldRefreshForRealtimeMessage,
  updateConversationSummary
} from "../utils";

const MESSAGE_ACK_TIMEOUT_MS = 8000;

// 多条实时消息连续到达时合并刷新会话列表，避免短时间内重复打接口。
const REALTIME_REFRESH_DEBOUNCE_MS = 200;

interface IPendingMessage {
  clientMsgId: string;
  content: IDataMessage["content"];
  conversationId: number;
  messageType: IDataMessage["message_type"];
  timeoutId?: number;
}

function useHomeWorkbenchHook(): IHomeWorkbenchViewModel {
  const params = useParams();

  const navigate = useNavigate();

  const session = getSession();

  const deviceId = useMemo(() => {
    return getDeviceId();
  }, []);

  const wsState = useWebSocketHook(session?.token || "", deviceId);

  const {
    lastEvent,
    sendJson,
    status: wsStatus
  } = wsState;

  const pendingMessagesRef = useRef<Record<string, IPendingMessage>>({});

  // WebSocket 事件回调需要读取最新状态，用 ref 避免把大数组放入 effect 依赖后频繁重建监听逻辑。
  const messagesRef = useRef<IDataMessage[]>([]);

  const conversationsRef = useRef<IDataConversationListItem[]>([]);

  // ack 和 deliver 可能都返回同一条消息；这里记录刚确认过的消息，降低重复刷新概率。
  const ackedMessageIdsRef = useRef<Set<number>>(new Set());

  const ackedClientMessageIdsRef = useRef<Set<string>>(new Set());

  const refreshConversationsTimerRef = useRef<null | number>(null);

  const [
    currentUser,
    setCurrentUser
  ] = useState<IDataGetCurrentUser | null>(session?.user || null);

  const [
    users,
    setUsers
  ] = useState<IDataListUsers>([]);

  const [
    conversations,
    setConversations
  ] = useState<IDataConversationListItem[]>([]);

  const [
    activeConversationId,
    setActiveConversationId
  ] = useState<number | null>(null);

  const [
    activeConversation,
    setActiveConversation
  ] = useState<IDataConversation | null>(null);

  const [
    messages,
    setMessages
  ] = useState<IDataMessage[]>([]);

  const [
    devices,
    setDevices
  ] = useState<IDataDevice[]>([]);

  const [
    presences,
    setPresences
  ] = useState<Record<number, IDataPresence>>({});

  const [
    searchResults,
    setSearchResults
  ] = useState<IDataMessage[]>([]);

  const [
    searchText,
    setSearchText
  ] = useState("");

  const [
    draftText,
    setDraftText
  ] = useState("");

  const [
    errorNotice,
    setErrorNotice
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    messageLoading,
    setMessageLoading
  ] = useState(false);

  const [
    sending,
    setSending
  ] = useState(false);

  const [
    directModalOpen,
    setDirectModalOpen
  ] = useState(false);

  const [
    groupModalOpen,
    setGroupModalOpen
  ] = useState(false);

  const [
    memberModalOpen,
    setMemberModalOpen
  ] = useState(false);

  const [
    profileModalOpen,
    setProfileModalOpen
  ] = useState(false);

  const [
    devicesOpen,
    setDevicesOpen
  ] = useState(false);

  const [
    selectedDirectUserId,
    setSelectedDirectUserId
  ] = useState<number | null>(null);

  const [
    selectedGroupUserIds,
    setSelectedGroupUserIds
  ] = useState<number[]>([]);

  const [
    groupForm
  ] = Form.useForm<IGroupFormValues>();

  const [
    addMemberForm
  ] = Form.useForm<IAddMemberFormValues>();

  const [
    profileForm
  ] = Form.useForm<IGroupProfileFormValues>();

  const userOptions = useMemo<IUserOption[]>(() => {
    return users.
        filter(user => {
          return Boolean(user.id) && user.id !== currentUser?.id;
        }).
        map(user => {
          return {
            label: `${getUserName(user)}${user.username ? ` (${user.username})` : ""}`,
            value: user.id as number
          };
        });
  }, [
    currentUser?.id,
    users
  ]);

  const activeConversationListItem = useMemo(() => {
    return conversations.find(conversation => {
      return conversation.id === activeConversationId;
    }) || null;
  }, [
    activeConversationId,
    conversations
  ]);

  const onlineCount = useMemo(() => {
    return Object.values(presences).filter(item => {
      return item.online;
    }).length;
  }, [
    presences
  ]);

  const activeTitle = getConversationTitle(activeConversation || activeConversationListItem);

  const reportError = useCallback((error: unknown, fallback: string): void => {
    if (isFormValidationError(error)) {
      return;
    }

    setErrorNotice(getActionErrorMessage(error, fallback));
  }, []);

  const loadConversations = useCallback(async (): Promise<IDataConversationListItem[]> => {
    const conversationList = await dataConversationList();

    setConversations(conversationList);

    return conversationList;
  }, []);

  const scheduleConversationRefresh = useCallback((fallback: string): void => {
    if (refreshConversationsTimerRef.current) {
      window.clearTimeout(refreshConversationsTimerRef.current);
    }

    refreshConversationsTimerRef.current = window.setTimeout(() => {
      refreshConversationsTimerRef.current = null;

      void loadConversations().catch(error => {
        reportError(error, fallback);
      });
    }, REALTIME_REFRESH_DEBOUNCE_MS);
  }, [
    loadConversations,
    reportError
  ]);

  const clearPendingMessage = useCallback((requestId: string): IPendingMessage | null => {
    const pendingMessage = pendingMessagesRef.current[requestId];

    if (!pendingMessage) {
      return null;
    }

    if (pendingMessage.timeoutId) {
      window.clearTimeout(pendingMessage.timeoutId);
    }

    const {
      [requestId]: _removedMessage,
      ...pendingMessages
    } = pendingMessagesRef.current;

    pendingMessagesRef.current = pendingMessages;

    return pendingMessage;
  }, []);

  const findPendingMessageByClientId = useCallback((clientMsgId?: string): [
    string,
    IPendingMessage
  ] | null => {
    if (!clientMsgId) {
      return null;
    }

    return Object.entries(pendingMessagesRef.current).find(([
      ,
      pendingMessage
    ]) => {
      return pendingMessage.clientMsgId === clientMsgId;
    }) || null;
  }, []);

  const rememberAckedMessage = useCallback((messageItem: IDataMessage): void => {
    if (messageItem.id > 0) {
      ackedMessageIdsRef.current.add(messageItem.id);
    }

    if (messageItem.client_msg_id) {
      ackedClientMessageIdsRef.current.add(messageItem.client_msg_id);
    }
  }, []);

  const isRecentlyAckedMessage = useCallback((messageItem: IDataMessage): boolean => {
    return ackedMessageIdsRef.current.has(messageItem.id) || Boolean(messageItem.client_msg_id && ackedClientMessageIdsRef.current.has(messageItem.client_msg_id));
  }, []);

  const sendMessageByHttp = useCallback(async (pendingMessage: IPendingMessage): Promise<void> => {
    setSending(true);

    try {

      // HTTP 发送是 WebSocket 不可用或 ack 超时后的兜底路径，必须复用同一个 client_msg_id。
      const response = await dataSendMessage({
        client_msg_id: pendingMessage.clientMsgId,
        content: pendingMessage.content || {},
        conversation_id: pendingMessage.conversationId,
        message_type: pendingMessage.messageType || "text"
      });

      setMessages(currentMessages => {
        return mergeMessage(currentMessages, response);
      });
      setConversations(currentConversations => {
        return updateConversationSummary(currentConversations, response, {
          activeConversationId,
          currentUserId: currentUser?.id
        });
      });
    } catch (error) {
      setMessages(currentMessages => {
        return markMessageFailed(currentMessages, pendingMessage.clientMsgId);
      });
      reportError(error, "消息发送失败");
    } finally {
      setSending(false);
    }
  }, [
    activeConversationId,
    currentUser?.id,
    reportError
  ]);

  const loadDevices = useCallback(async (): Promise<void> => {
    const deviceList = await dataDeviceList();

    setDevices(deviceList);
  }, []);

  const upsertCurrentDevice = useCallback(async (showSuccess: boolean, userId = currentUser?.id): Promise<void> => {
    if (!userId) {
      return;
    }

    try {

      // 设备 data 允许后端透传 JSON，前端保留平台和本地 deviceId 便于调试多端在线。
      await dataUpsertDevice({
        data: {
          app_version: "1.0.0",
          device_id: deviceId,
          platform: getDevicePlatform()
        },
        user_id: userId
      });

      await loadDevices();

      if (showSuccess) {
        message.success("当前设备已上报");
      }
    } catch (error) {
      if (showSuccess) {
        reportError(error, "上报设备失败");
      }
    }
  }, [
    currentUser?.id,
    deviceId,
    loadDevices,
    reportError
  ]);

  const loadPresence = useCallback(async (userList: IDataListUsers): Promise<void> => {
    const userIds = userList.
        map(user => {
          return user.id;
        }).
        filter((userId): userId is number => {
          return Boolean(userId);
        });

    if (userIds.length === 0) {
      return;
    }

    const presenceList = await dataBatchPresence({
      user_ids: userIds
    });

    setPresences(Object.fromEntries(presenceList.map(item => {
      return [
        item.user_id,
        item
      ];
    })));
  }, []);

  const loadInitialData = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setErrorNotice("");

    try {

      // 首页首屏需要三个互不依赖的数据源；并发加载能减少进入工作台的等待时间。
      const [
        userData,
        conversationList,
        userList
      ] = await Promise.all([
        dataGetCurrentUser(),
        loadConversations(),
        dataListUsers()
      ]);

      setCurrentUser(userData);
      setUsers(userList);

      // 在线状态和设备上报不阻塞首屏；设备上报成功后会顺带刷新设备列表。
      void loadPresence(userList).catch(error => {
        reportError(error, "在线状态加载失败");
      });
      void upsertCurrentDevice(false, userData.id);

      const routeConversationId = params.conversationId ? Number(params.conversationId) : null;

      const firstConversationId = conversationList[0]?.id || null;

      setActiveConversationId(routeConversationId || firstConversationId);
    } catch (error) {
      reportError(error, "工作台数据加载失败");

      return false;
    } finally {
      setLoading(false);
    }

    return true;
  }, [
    loadConversations,
    loadPresence,
    params.conversationId,
    reportError,
    upsertCurrentDevice
  ]);

  const loadActiveConversation = useCallback(async (conversationId: number): Promise<void> => {
    setMessageLoading(true);

    try {
      const [
        detail,
        messagePage
      ] = await Promise.all([
        dataConversationDetail({
          conversation_id: conversationId
        }),
        dataMessageList({
          conversation_id: conversationId,
          limit: 30
        })
      ]);

      const nextMessages = [
        ...messagePage.items
      // eslint-disable-next-line unicorn/no-array-sort
      ].sort((a, b) => {
        return a.id - b.id;
      });

      setActiveConversation(detail);
      setMessages(nextMessages);

      const lastMessageId = nextMessages.at(-1)?.id;

      if (lastMessageId) {

        // 已读状态是辅助写入，失败不应打断用户阅读消息。
        void dataMarkConversationRead({
          conversation_id: conversationId,
          last_read_message_id: lastMessageId
        }).catch(error => {
          reportError(error, "标记会话已读失败");
        });
      }
    } catch (error) {
      reportError(error, "会话详情或消息加载失败");
    } finally {
      setMessageLoading(false);
    }
  }, [
    reportError
  ]);

  const handleSelectConversation = useCallback((conversationId: number): void => {
    setActiveConversationId(conversationId);
    navigate(`/conversations/${conversationId}`);
  }, [
    navigate
  ]);

  const handleRefresh = useCallback(async (): Promise<void> => {
    try {
      const refreshed = await loadInitialData();

      if (!refreshed) {
        return;
      }

      if (activeConversationId) {
        await loadActiveConversation(activeConversationId);
      }

      message.success("已刷新会话数据");
    } catch (error) {
      reportError(error, "刷新会话失败");
    }
  }, [
    activeConversationId,
    loadActiveConversation,
    loadInitialData,
    reportError
  ]);

  const handleCreateDirect = useCallback(async (): Promise<void> => {
    if (!selectedDirectUserId) {
      message.warning("请选择一个用户");

      return;
    }

    try {
      const conversation = await dataCreateDirectConversation({
        target_user_id: selectedDirectUserId
      });

      setDirectModalOpen(false);
      setSelectedDirectUserId(null);
      await loadConversations();
      handleSelectConversation(conversation.id);
    } catch (error) {
      reportError(error, "创建单聊失败");
    }
  }, [
    handleSelectConversation,
    loadConversations,
    reportError,
    selectedDirectUserId
  ]);

  const handleCreateDirectWithUser = useCallback(async (userId: number): Promise<void> => {
    try {
      const conversation = await dataCreateDirectConversation({
        target_user_id: userId
      });

      setSelectedGroupUserIds([]);
      await loadConversations();
      handleSelectConversation(conversation.id);
    } catch (error) {
      reportError(error, "创建单聊失败");
    }
  }, [
    handleSelectConversation,
    loadConversations,
    reportError
  ]);

  const toggleSelectedGroupUser = useCallback((userId: number): void => {
    setSelectedGroupUserIds(currentUserIds => {
      if (currentUserIds.includes(userId)) {
        return currentUserIds.filter(currentUserId => {
          return currentUserId !== userId;
        });
      }

      return [
        ...currentUserIds,
        userId
      ];
    });
  }, []);

  const handleOpenGroupFromSelection = useCallback((): void => {
    if (selectedGroupUserIds.length === 0) {
      message.warning("请先选择在线成员");

      return;
    }

    if (selectedGroupUserIds.length === 1) {

      // 选中 1 人时右上角统一入口创建单聊；多人时才进入群聊弹窗。
      void handleCreateDirectWithUser(selectedGroupUserIds[0] as number);

      return;
    }

    groupForm.setFieldsValue({
      memberIds: selectedGroupUserIds,
      title: ""
    });
    setGroupModalOpen(true);
  }, [
    groupForm,
    handleCreateDirectWithUser,
    selectedGroupUserIds
  ]);

  const handleCreateGroup = useCallback(async (): Promise<void> => {
    try {
      const values = await groupForm.validateFields();

      const conversation = await dataCreateGroupConversation({
        avatar_url: values.avatarUrl,
        member_ids: values.memberIds,
        title: values.title
      });

      groupForm.resetFields();
      setSelectedGroupUserIds([]);
      setGroupModalOpen(false);
      await loadConversations();
      handleSelectConversation(conversation.id);
    } catch (error) {
      reportError(error, "创建群聊失败");
    }
  }, [
    groupForm,
    handleSelectConversation,
    loadConversations,
    reportError
  ]);

  const handleAddMembers = useCallback(async (): Promise<void> => {
    if (!activeConversationId) {
      message.warning("请先选择一个群聊");

      return;
    }

    try {
      const values = await addMemberForm.validateFields();

      await dataAddGroupMembers({
        conversation_id: activeConversationId,
        user_ids: values.userIds
      });

      addMemberForm.resetFields();
      setMemberModalOpen(false);
      await loadActiveConversation(activeConversationId);
      message.success("已添加群成员");
    } catch (error) {
      reportError(error, "添加群成员失败");
    }
  }, [
    activeConversationId,
    addMemberForm,
    loadActiveConversation,
    reportError
  ]);

  const handleOpenGroupProfile = useCallback((): void => {
    profileForm.setFieldsValue({
      avatarUrl: activeConversation?.avatar_url || "",
      title: activeConversation?.title || ""
    });
    setProfileModalOpen(true);
  }, [
    activeConversation?.avatar_url,
    activeConversation?.title,
    profileForm
  ]);

  const handleUpdateGroupProfile = useCallback(async (): Promise<void> => {
    if (!activeConversationId) {
      message.warning("请先选择一个群聊");

      return;
    }

    try {
      const values = await profileForm.validateFields();

      const response = await dataUpdateGroupProfile({
        avatar_url: values.avatarUrl,
        conversation_id: activeConversationId,
        title: values.title
      });

      setActiveConversation(response);
      setProfileModalOpen(false);
      await loadConversations();
      message.success("群资料已更新");
    } catch (error) {
      reportError(error, "更新群资料失败");
    }
  }, [
    activeConversationId,
    loadConversations,
    profileForm,
    reportError
  ]);

  const handleRemoveMember = useCallback(async (userId: number): Promise<void> => {
    if (!activeConversationId) {
      message.warning("请先选择一个群聊");

      return;
    }

    try {
      await dataRemoveGroupMember({
        conversation_id: activeConversationId,
        user_id: userId
      });

      await loadActiveConversation(activeConversationId);
      message.success("成员已移除");
    } catch (error) {
      reportError(error, "移除群成员失败");
    }
  }, [
    activeConversationId,
    loadActiveConversation,
    reportError
  ]);

  const handleUpdateMemberRole = useCallback(async (userId: number, role: string): Promise<void> => {
    if (!activeConversationId) {
      message.warning("请先选择一个群聊");

      return;
    }

    try {
      await dataUpdateMemberRole({
        conversation_id: activeConversationId,
        role,
        user_id: userId
      });

      await loadActiveConversation(activeConversationId);
      message.success("成员角色已更新");
    } catch (error) {
      reportError(error, "更新成员角色失败");
    }
  }, [
    activeConversationId,
    loadActiveConversation,
    reportError
  ]);

  const handleLeaveGroup = useCallback(async (): Promise<void> => {
    if (!activeConversationId) {
      message.warning("请先选择一个群聊");

      return;
    }

    try {
      await dataLeaveGroup({
        conversation_id: activeConversationId
      });

      const nextConversations = await loadConversations();

      const nextConversationId = nextConversations[0]?.id || null;

      setActiveConversationId(nextConversationId);
      navigate(nextConversationId ? `/conversations/${nextConversationId}` : "/");
      message.success("已退出群聊");
    } catch (error) {
      reportError(error, "退出群聊失败");
    }
  }, [
    activeConversationId,
    loadConversations,
    navigate,
    reportError
  ]);

  const handleSendMessage = useCallback(async (): Promise<void> => {
    const trimmedText = draftText.trim();

    if (!activeConversationId || !trimmedText || !currentUser?.id) {
      return;
    }

    const clientMsgId = createClientMessageId();

    const requestId = `message-${clientMsgId}`;

    const content = {
      text: trimmedText
    };

    const pendingMessage: IPendingMessage = {
      clientMsgId,
      content,
      conversationId: activeConversationId,
      messageType: "text"
    };

    const localMessage = createLocalSendingMessage({
      clientMsgId,
      content,
      conversationId: activeConversationId,
      messageType: "text",
      senderId: currentUser.id
    });

    // 先乐观插入本地消息，保证回车后界面即时响应。
    setMessages(currentMessages => {
      return mergeMessage(currentMessages, localMessage);
    });
    setDraftText("");

    const sentByWebSocket = sendJson({
      payload: {
        client_msg_id: clientMsgId,
        content,
        conversation_id: activeConversationId,
        message_type: "text"
      },
      request_id: requestId,
      type: "message.send"
    });

    if (sentByWebSocket) {

      // 超过 ack 等待时间后走 HTTP 兜底，避免消息一直卡在 sending。
      pendingMessage.timeoutId = window.setTimeout(() => {
        const timedOutMessage = clearPendingMessage(requestId);

        if (timedOutMessage) {
          void sendMessageByHttp(timedOutMessage);
        }
      }, MESSAGE_ACK_TIMEOUT_MS);
      pendingMessagesRef.current[requestId] = pendingMessage;

      return;
    }

    await sendMessageByHttp(pendingMessage);
  }, [
    activeConversationId,
    clearPendingMessage,
    currentUser?.id,
    draftText,
    sendMessageByHttp,
    sendJson
  ]);

  const handleSearch = useCallback(async (): Promise<void> => {
    if (!searchText.trim()) {
      setSearchResults([]);

      return;
    }

    try {
      const results = await dataMessageSearch({
        conversation_id: activeConversationId || undefined,
        keyword: searchText.trim(),
        limit: 20
      });

      setSearchResults(results);
    } catch (error) {
      reportError(error, "消息搜索失败");
    }
  }, [
    activeConversationId,
    reportError,
    searchText
  ]);

  const handleUpsertDevice = useCallback(async (): Promise<void> => {
    await upsertCurrentDevice(true);
  }, [
    upsertCurrentDevice
  ]);

  const handleDeleteDevice = useCallback(async (): Promise<void> => {
    try {
      await dataDeleteDevice();

      await loadDevices();
    } catch (error) {
      reportError(error, "删除设备失败");
    }
  }, [
    loadDevices,
    reportError
  ]);

  const handleLogout = useCallback((): void => {
    clearSession();
    navigate("/login", {
      replace: true
    });
  }, [
    navigate
  ]);

  useEffect(() => {
    void loadInitialData();
  }, [
    loadInitialData
  ]);

  useEffect(() => {
    const routeConversationId = params.conversationId ? Number(params.conversationId) : null;

    if (routeConversationId && routeConversationId !== activeConversationId) {
      setActiveConversationId(routeConversationId);
    }
  }, [
    activeConversationId,
    params.conversationId
  ]);

  useEffect(() => {
    if (activeConversationId) {
      void loadActiveConversation(activeConversationId);
    } else {
      setActiveConversation(null);
      setMessages([]);
    }
  }, [
    activeConversationId,
    loadActiveConversation
  ]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [
    messages
  ]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [
    conversations
  ]);

  useEffect(() => {
    const wsEvent = lastEvent;

    const realtimeMessage = pickWsMessage(wsEvent?.payload);

    if (wsEvent?.type === "error") {

      // 服务端返回 error 时优先定位对应 request_id，把本地 sending 消息标记失败。
      const pendingMessage = wsEvent.requestId ? clearPendingMessage(wsEvent.requestId) : null;

      if (pendingMessage) {
        setMessages(currentMessages => {
          return markMessageFailed(currentMessages, pendingMessage.clientMsgId);
        });
        setSending(false);
      }

      const errorMessage = getActionErrorMessage(wsEvent.payload, "消息发送失败");

      setErrorNotice(errorMessage);

      return;
    }

    if (!realtimeMessage) {
      return;
    }

    if (wsEvent?.type === "message.ack") {

      // ack 只确认发送方本地消息；真正的广播还可能随后以 deliver 到达。
      const pendingByRequestId = wsEvent.requestId ? clearPendingMessage(wsEvent.requestId) : null;

      if (!pendingByRequestId) {
        const pendingByClientId = findPendingMessageByClientId(realtimeMessage.client_msg_id);

        if (pendingByClientId) {
          clearPendingMessage(pendingByClientId[0]);
        }
      }

      setSending(false);
      rememberAckedMessage(realtimeMessage);

      if (realtimeMessage.conversation_id === activeConversationId) {
        setMessages(currentMessages => {
          return replaceSendingMessage(currentMessages, realtimeMessage);
        });
      }

      return;
    }

    const isRecentlyAcked = isRecentlyAckedMessage(realtimeMessage);

    const shouldRefreshIfMissing = !isRecentlyAcked && shouldRefreshForRealtimeMessage(wsEvent?.type, realtimeMessage, messagesRef.current);

    if (realtimeMessage.conversation_id === activeConversationId) {
      setMessages(currentMessages => {
        return mergeMessage(currentMessages, realtimeMessage);
      });
    }

    const conversationExists = conversationsRef.current.some(conversation => {
      return conversation.id === realtimeMessage.conversation_id;
    });

    setConversations(currentConversations => {
      return updateConversationSummary(currentConversations, realtimeMessage, {
        activeConversationId,
        currentUserId: currentUser?.id
      });
    });

    if (!conversationExists && shouldRefreshIfMissing) {
      scheduleConversationRefresh("实时消息后刷新会话列表失败");
    }
  }, [
    activeConversationId,
    clearPendingMessage,
    currentUser?.id,
    findPendingMessageByClientId,
    isRecentlyAckedMessage,
    lastEvent,
    rememberAckedMessage,
    scheduleConversationRefresh
  ]);

  useEffect(() => {
    return () => {
      if (refreshConversationsTimerRef.current) {
        window.clearTimeout(refreshConversationsTimerRef.current);
      }

      for (const pendingMessage of Object.values(pendingMessagesRef.current)) {
        if (pendingMessage.timeoutId) {
          window.clearTimeout(pendingMessage.timeoutId);
        }
      }

      pendingMessagesRef.current = {};
    };
  }, []);

  const state: IHomeWorkbenchState = {
    activeConversation,
    activeConversationId,
    activeTitle,
    conversations,
    currentUser,
    deviceId,
    devices,
    draftText,
    errorNotice,
    loading,
    messageLoading,
    messages,
    onlineCount,
    presences,
    searchResults,
    searchText,
    selectedDirectUserId,
    selectedGroupUserIds,
    sending,
    users,
    wsStatus
  };

  const dialogs: IHomeWorkbenchDialogs = {
    devicesOpen,
    directModalOpen,
    groupModalOpen,
    memberModalOpen,
    profileModalOpen
  };

  const forms: IHomeWorkbenchForms = {
    addMemberForm,
    groupForm,
    profileForm
  };

  const actions: IHomeWorkbenchActions = {
    clearErrorNotice: () => {
      return setErrorNotice("");
    },
    handleAddMembers,
    handleCreateDirect,
    handleCreateDirectWithUser,
    handleCreateGroup,
    handleDeleteDevice,
    handleLeaveGroup,
    handleOpenGroupFromSelection,
    handleLogout,
    handleOpenGroupProfile,
    handleRefresh,
    handleRemoveMember,
    handleSearch,
    handleSelectConversation,
    handleSendMessage,
    handleUpdateGroupProfile,
    handleUpdateMemberRole,
    handleUpsertDevice,
    setDevicesOpen,
    setDirectModalOpen,
    setDraftText,
    setGroupModalOpen,
    setMemberModalOpen,
    setProfileModalOpen,
    setSearchResults,
    setSearchText,
    setSelectedDirectUserId,
    setSelectedGroupUserIds,
    toggleSelectedGroupUser
  };

  return {
    actions,
    dialogs,
    forms,
    state,
    userOptions
  };
}

export { useHomeWorkbenchHook };
