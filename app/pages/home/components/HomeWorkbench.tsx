import {
  Alert,
  Layout
} from "antd";
import type {
  ReactElement
} from "react";
import {
  useState
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
  const [
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  ] = useState(false);

  const {
    actions,
    state
  } = viewModel;

  return (
    <main className="flow-workbench bg-[#f0f2f5] text-[#050505]">
      <Layout className="flow-workbench-layout bg-transparent">
        <ConversationSidebar
          isMobileOpen={isMobileSidebarOpen}
          viewModel={viewModel}
          onMobileClose={() => {
            setIsMobileSidebarOpen(false);
          }} />

        <button
          aria-label="关闭联系人栏"
          className={`flow-mobile-sidebar-backdrop ${isMobileSidebarOpen ? "is-visible" : ""}`}
          type="button"
          onClick={() => {
            setIsMobileSidebarOpen(false);
          }} />

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
            viewModel={viewModel}
            onOpenMobileSidebar={() => {
              setIsMobileSidebarOpen(true);
            }} />

          <section className="flow-workbench-main min-h-0 flex-1">
            <MessagePanel viewModel={viewModel} />
          </section>
        </Content>
      </Layout>

      <WorkspaceDialogs viewModel={viewModel} />
    </main>
  );
}

export { HomeWorkbench };
