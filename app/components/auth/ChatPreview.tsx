import type {
  ReactElement
} from "react";

const messages = [
  {
    content: "今天的接口文档已经同步，登录注册可以先联调。",
    name: "后端同学",
    side: "left",
    time: "09:26"
  },
  {
    content: "收到，我会把 token 和用户信息先持久化起来。",
    name: "前端同学",
    side: "right",
    time: "09:28"
  },
  {
    content: "Flow Talk 新会话已准备好。",
    name: "系统",
    side: "left",
    time: "Now"
  }
];

export function ChatPreview(): ReactElement {
  return (
    <div
      className="chat-preview"
      aria-label="Flow Talk 聊天预览">
      <div className="chat-preview-header">
        <div>
          <strong>
            项目群聊
          </strong>

          <span>
            12 人在线
          </span>
        </div>

        <div className="online-dot" />
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
    </div>
  );
}
