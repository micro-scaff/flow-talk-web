import {
  MessageOutlined,
  ReloadOutlined,
  TeamOutlined
} from "@ant-design/icons";
import {
  Button,
  Space,
  Spin,
  Tag,
  Tooltip,
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
  ContactList
} from "./ContactList";
import {
  GroupConversationList
} from "./GroupConversationList";

const {
  Text
} = Typography;

interface ISidebarListProps {
  activeDirectUserId?: number;
  activeGroupConversationId?: number;
  directConversationByUserId: Map<number, IDataConversationListItem>;
  normalizedKeyword: string;
  onOpenContact: (userId: number) => Promise<void>;
  openingUserId: number | null;
  viewModel: IHomeWorkbenchViewModel;
  visibleContacts: IDataListUsers;
  visibleGroupConversations: IDataConversationListItem[];
}

function SidebarList({
  activeDirectUserId,
  activeGroupConversationId,
  directConversationByUserId,
  normalizedKeyword,
  onOpenContact,
  openingUserId,
  viewModel,
  visibleContacts,
  visibleGroupConversations
}: ISidebarListProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const hasVisibleItems = visibleContacts.length > 0 || visibleGroupConversations.length > 0;

  return (
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
                {visibleContacts.length + visibleGroupConversations.length}
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

              <Tooltip title="创建群聊">
                <Button
                  aria-label="创建群聊"
                  className="flow-mobile-create-group-button flow-icon-button"
                  icon={<TeamOutlined />}
                  shape="circle"
                  size="small"
                  type="primary"
                  onClick={actions.handleOpenGroupCreate} />
              </Tooltip>
            </Space>
          </div>

          <GroupConversationList
            activeConversationId={activeGroupConversationId}
            conversations={visibleGroupConversations}
            viewModel={viewModel} />

          <ContactList
            activeUserId={activeDirectUserId}
            contacts={visibleContacts}
            directConversationByUserId={directConversationByUserId}
            onOpenContact={onOpenContact}
            openingUserId={openingUserId}
            viewModel={viewModel} />

          {!hasVisibleItems && (
            <div className="flow-contact-empty">
              <div className="flow-empty-avatar">
                <MessageOutlined />
              </div>

              <Text className="text-sm font-bold">
                {normalizedKeyword ? "未找到匹配结果" : "暂无联系人或群聊"}
              </Text>

              <Text className="flow-muted-text mt-1 text-xs">
                {normalizedKeyword ? "请尝试联系人姓名、账号或群聊名称" : "等待新用户加入，或创建一个群聊"}
              </Text>
            </div>
          )}
        </section>
      </div>
    </Spin>
  );
}

export { SidebarList };
