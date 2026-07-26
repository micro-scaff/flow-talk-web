import type {
  ReactElement
} from "react";

const messages = [
  {
    content: "首页方案已同步，留白和层级都舒服多了。",
    name: "Mia",
    side: "left",
    time: "10:24"
  },
  {
    content: "收到，今天把交互细节一起收尾。",
    name: "You",
    side: "right",
    time: "10:26"
  },
  {
    content: "发布清单已经更新 ✓",
    name: "Lin",
    side: "left",
    time: "刚刚"
  }
];

export function ChatPreview(): ReactElement {
  return (
    <div
      className="chat-preview"
      aria-label="Flow Talk 聊天预览">
      <div className="chat-preview-header">
        <div className="chat-preview-identity">
          <div
            className="chat-preview-avatars"
            aria-hidden="true">
            <span>M</span>
            <span>L</span>
            <span>Y</span>
          </div>

          <div>
            <strong>产品设计</strong>
            <span>6 位成员 · 3 人在线</span>
          </div>
        </div>

        <div
          className="online-dot"
          aria-label="在线" />
      </div>

      <div className="chat-message-list">
        {messages.map(message => {
          return (
            <div
              className={`chat-message is-${message.side}`}
              key={`${message.name}-${message.time}`}>
              <span className="chat-author">
                {message.name}
              </span>

              <p>
                {message.content}
              </p>

              <time>
                {message.time}
              </time>
            </div>
          );
        })}
      </div>

      <div className="chat-preview-composer">
        <span>输入消息…</span>
        <i>↗</i>
      </div>
    </div>
  );
}
