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

    let viewportSyncFrame: number | null = null;

    const syncWorkbenchViewport = (): void => {
      viewportSyncFrame = null;

      const {
        visualViewport
      } = window;

      const viewportWidth = Math.floor(visualViewport?.width || window.innerWidth);

      const layoutViewportHeight = Math.floor(window.innerHeight);

      const visibleViewportHeight = Math.floor(visualViewport?.height || layoutViewportHeight);

      const viewportTop = Math.floor(visualViewport?.offsetTop || 0);

      const viewportLeft = Math.floor(visualViewport?.offsetLeft || 0);

      const keyboardInset = Math.max(0, layoutViewportHeight - visibleViewportHeight - viewportTop);

      root.style.setProperty("--flow-viewport-width", `${viewportWidth}px`);
      root.style.setProperty("--flow-viewport-height", `${layoutViewportHeight}px`);
      root.style.setProperty("--flow-visible-viewport-height", `${visibleViewportHeight}px`);
      root.style.setProperty("--flow-viewport-left", `${viewportLeft}px`);
      root.style.setProperty("--flow-keyboard-inset", `${keyboardInset}px`);
    };

    const scheduleWorkbenchViewportSync = (): void => {
      if (viewportSyncFrame !== null) {
        return;
      }

      viewportSyncFrame = window.requestAnimationFrame(syncWorkbenchViewport);
    };

    syncWorkbenchViewport();
    window.visualViewport?.addEventListener("resize", scheduleWorkbenchViewportSync);
    window.visualViewport?.addEventListener("scroll", scheduleWorkbenchViewportSync);
    window.addEventListener("resize", scheduleWorkbenchViewportSync);

    return () => {
      if (viewportSyncFrame !== null) {
        window.cancelAnimationFrame(viewportSyncFrame);
      }

      window.visualViewport?.removeEventListener("resize", scheduleWorkbenchViewportSync);
      window.visualViewport?.removeEventListener("scroll", scheduleWorkbenchViewportSync);
      window.removeEventListener("resize", scheduleWorkbenchViewportSync);
      root.style.removeProperty("--flow-viewport-width");
      root.style.removeProperty("--flow-viewport-height");
      root.style.removeProperty("--flow-visible-viewport-height");
      root.style.removeProperty("--flow-viewport-left");
      root.style.removeProperty("--flow-keyboard-inset");
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
