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
  ConversationDetailPanel
} from "./ConversationDetailPanel";
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
    <main className="min-h-screen bg-[#f0f2f5] text-[#050505]">
      <Layout className="min-h-screen bg-transparent">
        <ConversationSidebar viewModel={viewModel} />

        <Content className="flex min-w-0 flex-col">
          {state.errorNotice && (
            <Alert
              banner
              closable
              message={state.errorNotice}
              type="error"
              onClose={actions.clearErrorNotice} />
          )}

          <WorkspaceHeader viewModel={viewModel} />

          {/* 主区保持消息流优先，右侧信息栏只在宽屏展示，避免窄屏挤压阅读空间。 */}
          <section className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
            <MessagePanel viewModel={viewModel} />
            <ConversationDetailPanel viewModel={viewModel} />
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
