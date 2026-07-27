import {
  Layout
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
  getDirectConversationPeerId,
  getUserName
} from "../utils";
import {
  SidebarHeader
} from "./conversation-sidebar/SidebarHeader";
import {
  SidebarList
} from "./conversation-sidebar/SidebarList";
import {
  normalizeSearchValue,
  sortCopy
} from "./conversation-sidebar/sidebar-model";

const {
  Sider
} = Layout;

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

  const groupConversations = useMemo(() => {
    const availableGroups = state.conversations.filter(conversation => {
      if (conversation.type !== "group") {
        return false;
      }

      if (!conversation.members?.length) {
        return true;
      }

      return conversation.members.some(member => {
        return member.user_id === state.currentUser?.id && member.status === "active";
      });
    });

    return sortCopy(availableGroups, (source, target) => {
      const sourceLastMessageAt = source.last_message_at ? new Date(source.last_message_at).getTime() : 0;

      const targetLastMessageAt = target.last_message_at ? new Date(target.last_message_at).getTime() : 0;

      if (sourceLastMessageAt !== targetLastMessageAt) {
        return targetLastMessageAt - sourceLastMessageAt;
      }

      return getConversationDisplayTitle(source, state.currentUser?.id, state.users).localeCompare(getConversationDisplayTitle(target, state.currentUser?.id, state.users), "zh-CN");
    });
  }, [
    state.conversations,
    state.currentUser?.id,
    state.users
  ]);

  const visibleGroupConversations = useMemo(() => {
    if (!normalizedKeyword) {
      return groupConversations;
    }

    return groupConversations.filter(conversation => {
      const searchableText = getConversationDisplayTitle(conversation, state.currentUser?.id, state.users).toLocaleLowerCase("zh-CN");

      return searchableText.includes(normalizedKeyword);
    });
  }, [
    groupConversations,
    normalizedKeyword,
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

  const activeDirectUserId = state.activeConversation?.type === "direct" ? getDirectConversationPeerId(state.activeConversation, state.currentUser?.id) : undefined;

  const activeGroupConversationId = state.activeConversation?.type === "group" ? state.activeConversation.id : undefined;

  async function handleOpenContact(userId: number): Promise<void> {
    if (openingUserId !== null) {
      return;
    }

    const existingConversation = directConversationByUserId.get(userId);

    setOpeningUserId(userId);

    try {
      if (existingConversation) {
        await actions.handleSelectConversation(existingConversation.id);

        return;
      }

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
        <SidebarHeader
          contactCount={contacts.length}
          currentUserName={getUserName(state.currentUser)}
          isDark={isDark}
          keyword={keyword}
          onlineContactCount={onlineContactCount}
          setKeyword={setKeyword}
          toggleTheme={toggleTheme}
          totalUnreadCount={totalUnreadCount}
          viewModel={viewModel} />

        <SidebarList
          activeDirectUserId={activeDirectUserId}
          activeGroupConversationId={activeGroupConversationId}
          directConversationByUserId={directConversationByUserId}
          normalizedKeyword={normalizedKeyword}
          onOpenContact={handleOpenContact}
          openingUserId={openingUserId}
          viewModel={viewModel}
          visibleContacts={visibleContacts}
          visibleGroupConversations={visibleGroupConversations} />
      </div>
    </Sider>
  );
}

export { ConversationSidebar };
