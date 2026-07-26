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
