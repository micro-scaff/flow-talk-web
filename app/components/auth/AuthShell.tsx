import {
  MoonOutlined,
  SunOutlined
} from "@ant-design/icons";
import {
  Button,
  Typography
} from "antd";
import type {
  ReactElement,
  ReactNode
} from "react";
import {
  useEffect
} from "react";

import {
  useThemeHook
} from "~/hooks/use-theme-hook";

import {
  ChatPreview
} from "./ChatPreview";

interface IAuthShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
}

export function AuthShell({
  children,
  eyebrow,
  title
}: IAuthShellProps): ReactElement {
  const {
    isDark,
    toggleTheme
  } = useThemeHook();

  useEffect(() => {
    const root = document.documentElement;

    const listenerOptions = {
      capture: true
    };

    let resetTimeoutIds: number[] = [];

    document.body.dataset.authRoute = "true";
    root.dataset.authRoute = "true";

    const syncAuthViewport = (): void => {
      const {
        visualViewport
      } = window;

      const viewportWidth = Math.floor(visualViewport?.width || window.innerWidth);

      const viewportHeight = Math.floor(visualViewport?.height || window.innerHeight);

      const viewportLeft = Math.floor(visualViewport?.offsetLeft || 0);

      root.style.setProperty("--auth-viewport-width", `${viewportWidth}px`);
      root.style.setProperty("--auth-viewport-height", `${viewportHeight}px`);
      root.style.setProperty("--auth-viewport-left", `${viewportLeft}px`);
    };

    const clearScheduledResets = (): void => {
      for (const timeoutId of resetTimeoutIds) {
        window.clearTimeout(timeoutId);
      }

      resetTimeoutIds = [];
    };

    const resetHorizontalScroll = (): void => {
      syncAuthViewport();

      const authPage = document.querySelector<HTMLElement>(".auth-page");

      const appRoot = document.querySelector<HTMLElement>("#root");

      root.scrollLeft = 0;
      document.body.scrollLeft = 0;
      appRoot?.scrollTo({
        left: 0,
        top: appRoot.scrollTop
      });
      authPage?.scrollTo({
        left: 0,
        top: authPage.scrollTop
      });
      window.scrollTo({
        left: 0,
        top: window.scrollY
      });
    };

    const scheduleResetHorizontalScroll = (): void => {
      clearScheduledResets();
      syncAuthViewport();
      resetHorizontalScroll();

      for (const delay of [
        0,
        80,
        180,
        360
      ]) {
        const timeoutId = window.setTimeout(resetHorizontalScroll, delay);

        resetTimeoutIds.push(timeoutId);
      }
    };

    const handleFocusIn = (event: FocusEvent): void => {
      if (!(event.target instanceof HTMLElement) || !event.target.closest(".auth-page")) {
        return;
      }

      scheduleResetHorizontalScroll();
    };

    syncAuthViewport();
    document.addEventListener("focusin", handleFocusIn, listenerOptions);
    window.visualViewport?.addEventListener("resize", scheduleResetHorizontalScroll);
    window.visualViewport?.addEventListener("scroll", scheduleResetHorizontalScroll);
    window.addEventListener("resize", scheduleResetHorizontalScroll);

    return () => {
      clearScheduledResets();
      document.removeEventListener("focusin", handleFocusIn, listenerOptions);
      window.visualViewport?.removeEventListener("resize", scheduleResetHorizontalScroll);
      window.visualViewport?.removeEventListener("scroll", scheduleResetHorizontalScroll);
      window.removeEventListener("resize", scheduleResetHorizontalScroll);
      root.style.removeProperty("--auth-viewport-width");
      root.style.removeProperty("--auth-viewport-height");
      root.style.removeProperty("--auth-viewport-left");
      delete document.body.dataset.authRoute;
      delete root.dataset.authRoute;
    };
  }, []);

  return (
    <main className="auth-page">
      <section
        className="auth-brand-plane"
        aria-label="Flow Talk 流言预览">
        <header className="auth-brand-header">
          <div
            className="auth-wordmark"
            aria-label="Flow Talk">
            <span className="brand-mark">F</span>
            <span>Flow Talk</span>
          </div>

          <span className="auth-version">WEB / 01</span>
        </header>

        <div className="brand-panel">
          <div className="brand-copy-block">
            <Typography.Text className="auth-eyebrow">
              {eyebrow}
            </Typography.Text>

            <Typography.Title
              className="brand-title"
              level={1}>
              Flow Talk
            </Typography.Title>

            <Typography.Paragraph className="brand-copy">
              让每句流言，沿人群自然流动。
            </Typography.Paragraph>
          </div>

          <ChatPreview />
        </div>

        <footer className="auth-brand-footer">
          <span>实时流言</span>
          <span>在线耳语</span>
          <span>消息回声</span>
        </footer>
      </section>

      <section
        className="auth-access-panel"
        aria-label="Flow Talk 账号认证">
        <div className="auth-topbar">
          <span className="auth-access-label">RUMOR ACCESS</span>

          <Button
            aria-label={isDark ? "切换到白天模式" : "切换到黑夜模式"}
            className="theme-toggle"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            shape="circle" />
        </div>

        <div className="auth-card-zone">
          <div className="auth-form-heading">
            <Typography.Title
              className="form-title"
              level={2}>
              {title}
            </Typography.Title>

            <Typography.Text className="form-support">
              进入你的流言现场，听听大家正在说什么。
            </Typography.Text>
          </div>

          {children}
        </div>

        <p className="auth-legal">Flow Talk · Whispers in motion</p>
      </section>
    </main>
  );
}
