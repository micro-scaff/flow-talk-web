import {
  Space
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  getConversationDisplayTitle
} from "../utils";
import {
  ConversationInfoCard
} from "./conversation-detail/ConversationInfoCard";
import {
  ConversationMemberList
} from "./conversation-detail/ConversationMemberList";

interface IConversationDetailPanelProps {
  viewModel: IHomeWorkbenchViewModel;
}

function ConversationDetailPanel({
  viewModel
}: IConversationDetailPanelProps): ReactElement {
  const {
    state
  } = viewModel;

  // 前端权限展示严格跟随后端 owner/admin/member 矩阵，减少无权限操作产生的无效请求。
  const currentMember = state.activeConversation?.members?.find(member => {
    return member.user_id === state.currentUser?.id && member.status === "active";
  });

  const canManageGroup = currentMember?.role === "owner" || currentMember?.role === "admin";

  const detailTitle = state.activeConversation ? getConversationDisplayTitle(state.activeConversation, state.currentUser?.id, state.users) : state.activeTitle;

  const activeConversationSummary = state.conversations.find(conversation => {
    return conversation.id === state.activeConversationId;
  });

  const lastMessageAt = activeConversationSummary?.last_message_at || state.activeConversation?.last_message_at;

  return (
    <aside className="flow-conversation-detail border-l border-[#dadde1] bg-white p-5">
      <Space
        className="w-full"
        orientation="vertical"
        size={16}>
        <ConversationInfoCard
          canManageGroup={canManageGroup}
          currentMember={currentMember}
          detailTitle={detailTitle}
          lastMessageAt={lastMessageAt}
          viewModel={viewModel} />

        <ConversationMemberList
          canManageGroup={canManageGroup}
          currentMember={currentMember}
          viewModel={viewModel} />
      </Space>
    </aside>
  );
}

export { ConversationDetailPanel };
