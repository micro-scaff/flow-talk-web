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

  return (
    <main className="flow-workbench bg-[#f0f2f5] text-[#050505]">
      <Layout className="flow-workbench-layout bg-transparent">
        <ConversationSidebar viewModel={viewModel} />

        <Content className="flow-workbench-content flex min-w-0 flex-col">
          {state.errorNotice && (
            <Alert
              banner
              closable
              message={state.errorNotice}
              type="error"
              onClose={actions.clearErrorNotice} />
          )}

          <WorkspaceHeader viewModel={viewModel} />

          <section className="flow-workbench-main min-h-0 flex-1">
            <MessagePanel viewModel={viewModel} />
          </section>
        </Content>
      </Layout>

      <WorkspaceDialogs viewModel={viewModel} />
    </main>
  );
}

export {
  HomeWorkbench
};
