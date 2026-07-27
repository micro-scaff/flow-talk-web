import {
  Drawer
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  ConversationDetailPanel
} from "./ConversationDetailPanel";
import {
  AddMemberModal
} from "./workspace-dialogs/AddMemberModal";
import {
  DevicesDrawer
} from "./workspace-dialogs/DevicesDrawer";
import {
  DirectConversationModal
} from "./workspace-dialogs/DirectConversationModal";
import {
  GroupCreateModal
} from "./workspace-dialogs/GroupCreateModal";
import {
  GroupProfileModal
} from "./workspace-dialogs/GroupProfileModal";

interface IWorkspaceDialogsProps {
  viewModel: IHomeWorkbenchViewModel;
}

function WorkspaceDialogs({
  viewModel
}: IWorkspaceDialogsProps): ReactElement {
  const {
    actions, dialogs
  } = viewModel;

  return (
    <>
      <DirectConversationModal viewModel={viewModel} />
      <GroupCreateModal viewModel={viewModel} />
      <AddMemberModal viewModel={viewModel} />
      <GroupProfileModal viewModel={viewModel} />

      <Drawer
        open={dialogs.detailsOpen}
        size={420}
        title="会话详情"
        onClose={() => {
          return actions.setDetailsOpen(false);
        }}>
        <ConversationDetailPanel viewModel={viewModel} />
      </Drawer>

      <DevicesDrawer viewModel={viewModel} />
    </>
  );
}

export { WorkspaceDialogs };
