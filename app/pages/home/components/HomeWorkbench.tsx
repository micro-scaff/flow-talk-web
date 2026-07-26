import {
  Alert,
  Layout
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IHomeWorkbenchViewModel
} from "../type";
import {
  ConversationSidebar
} from "./ConversationSidebar";
import {
  ConversationDetailPanel
} from "./ConversationDetailPanel";
import {
  MessagePanel
} from "./MessagePanel";
import {
  WorkspaceDialogs
} from "./WorkspaceDialogs";
import {
  WorkspaceHeader
} from "./WorkspaceHeader";

const {
  Content
} = Layout;

interface IHomeWorkbenchProps {
  viewModel: IHomeWorkbenchViewModel;
}

function HomeWorkbench({
  viewModel
}: IHomeWorkbenchProps): ReactElement {
  const {
    actions,
    state
  } = viewModel;

  const isContactMode = !state.activeConversationId;

  return (
    <main className={`flow-workbench ${isContactMode ? "is-mobile-contact-mode" : ""}`}>
      <Layout className="flow-workbench-layout bg-transparent">
        <ConversationSidebar
          viewModel={viewModel} />

        <Content className="flow-workbench-content flex min-w-0 flex-col">
          {state.errorNotice && (
            <Alert
              banner
              closable
              message={state.errorNotice}
              type="error"
              onClose={actions.clearErrorNotice} />
          )}

          <WorkspaceHeader
            viewModel={viewModel} />

          <section className={`flow-workbench-main min-h-0 flex-1 ${state.activeConversationId ? "has-detail-panel" : ""}`}>
            <MessagePanel viewModel={viewModel} />

            {state.activeConversationId && (
              <ConversationDetailPanel viewModel={viewModel} />
            )}
          </section>
        </Content>
      </Layout>

      <WorkspaceDialogs viewModel={viewModel} />
    </main>
  );
}

export { HomeWorkbench };
