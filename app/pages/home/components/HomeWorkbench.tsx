import {
  Alert,
  Layout
} from "antd";
import type {
  ReactElement
} from "react";
import {
  useEffect
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

  const isContactMode = state.contactListVisible;

  useEffect(() => {
    const root = document.documentElement;

    const syncWorkbenchViewport = (): void => {
      const {
        visualViewport
      } = window;

      const viewportWidth = Math.floor(visualViewport?.width || window.innerWidth);

      const viewportHeight = Math.floor(visualViewport?.height || window.innerHeight);

      const viewportLeft = Math.floor(visualViewport?.offsetLeft || 0);

      root.style.setProperty("--flow-viewport-width", `${viewportWidth}px`);
      root.style.setProperty("--flow-viewport-height", `${viewportHeight}px`);
      root.style.setProperty("--flow-viewport-left", `${viewportLeft}px`);
    };

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(syncWorkbenchViewport);

    syncWorkbenchViewport();
    resizeObserver?.observe(root);
    window.visualViewport?.addEventListener("resize", syncWorkbenchViewport);
    window.visualViewport?.addEventListener("scroll", syncWorkbenchViewport);

    return () => {
      resizeObserver?.disconnect();
      window.visualViewport?.removeEventListener("resize", syncWorkbenchViewport);
      window.visualViewport?.removeEventListener("scroll", syncWorkbenchViewport);
      root.style.removeProperty("--flow-viewport-width");
      root.style.removeProperty("--flow-viewport-height");
      root.style.removeProperty("--flow-viewport-left");
    };
  }, []);

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
