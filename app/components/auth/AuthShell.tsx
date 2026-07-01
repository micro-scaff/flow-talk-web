import {
  MoonOutlined,
  SunOutlined
} from "@ant-design/icons";
import {
  Button,
  Space,
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
        className="auth-hero"
        aria-label="Flow Talk 账号认证">
        <div className="auth-topbar">
          <div
            className="brand-mark"
            aria-label="Flow Talk">
            FT
          </div>

          <Button
            aria-label={isDark ? "切换到白天模式" : "切换到黑夜模式"}
            className="theme-toggle"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            shape="circle" />
        </div>

        <div className="auth-grid">
          <div className="brand-panel">
            <Space
              className="brand-copy-block"
              orientation="vertical"
              size={20}>
              <Typography.Text className="auth-eyebrow">
                {eyebrow}
              </Typography.Text>

              <Typography.Title
                className="brand-title"
                level={1}>
                Flow Talk
              </Typography.Title>

              <Typography.Paragraph className="brand-copy">
                把分散的消息、团队讨论和个人联系人收束到一个清爽的即时通讯空间。
              </Typography.Paragraph>
            </Space>

            <ChatPreview />
          </div>

          <div className="auth-card-zone">
            <Typography.Title
              className="form-title"
              level={2}>
              {title}
            </Typography.Title>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
