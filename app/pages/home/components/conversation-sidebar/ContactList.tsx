import {
  Avatar,
  Badge,
  Typography
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IDataConversationListItem,
  IDataListUsers
} from "~/api";

import type {
  IHomeWorkbenchViewModel
} from "../../type";
import {
  getUserName
} from "../../utils";

const {
  Text
} = Typography;

interface IContactListProps {
  activeUserId?: number;
  contacts: IDataListUsers;
  directConversationByUserId: Map<number, IDataConversationListItem>;
  onOpenContact: (userId: number) => Promise<void>;
  openingUserId: number | null;
  viewModel: IHomeWorkbenchViewModel;
}

function ContactList({
  activeUserId,
  contacts,
  directConversationByUserId,
  onOpenContact,
  openingUserId,
  viewModel
}: IContactListProps): ReactElement | null {
  const {
    state
  } = viewModel;

  if (contacts.length === 0) {
    return null;
  }

  return (
    <div className="flow-contact-section">
      <div className="flow-contact-section-heading">
        <Text className="flow-list-eyebrow">PEOPLE</Text>

        <Text className="flow-muted-text text-xs">
          {contacts.length}
          {" "}
          位联系人
        </Text>
      </div>

      <div className="flow-contact-list">
        {contacts.map(user => {
          const userId = user.id as number;

          const isOnline = Boolean(state.presences[userId]?.online);

          const unreadCount = directConversationByUserId.get(userId)?.unread_count || 0;

          const isOpening = openingUserId === userId;

          const userName = getUserName(user);

          return (
            <button
              aria-busy={isOpening}
              aria-current={activeUserId === userId ? "page" : undefined}
              className={`flow-contact-row ${activeUserId === userId ? "is-active" : ""}`}
              disabled={openingUserId !== null}
              key={userId}
              type="button"
              onClick={() => {
                void onOpenContact(userId);
              }}>
              <Badge
                count={unreadCount}
                offset={[
                  -2,
                  2
                ]}
                overflowCount={99}
                size="small">
                <Avatar
                  size={42}
                  src={user.avatar_url || undefined}>
                  {userName.slice(0, 1)}
                </Avatar>
              </Badge>

              <span className="flow-contact-copy">
                <span className="flow-contact-heading">
                  <Text
                    className="min-w-0"
                    strong
                    ellipsis
                    title={userName}>
                    {userName}
                  </Text>

                  <span className={`flow-contact-presence ${isOnline ? "is-online" : ""}`}>
                    <i />
                    {isOnline ? "在线" : "离线"}
                  </span>
                </span>

                <Text
                  className="flow-muted-text"
                  ellipsis>
                  {isOpening ? "正在打开流言…" : (user.username ? `@${user.username}` : `ID ${userId}`)}
                </Text>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { ContactList };
