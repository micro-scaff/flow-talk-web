import type {
  ReactElement
} from "react";

const messages = [
  {
    content: "听说楼下那家店今晚要换招牌？",
    name: "Mia",
    side: "left",
    time: "10:24"
  },
  {
    content: "我也听到了，不过还没人证实。",
    name: "You",
    side: "right",
    time: "10:26"
  },
  {
    content: "刚有人说老板只是重新装修 👀",
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
            <strong>楼下发生什么</strong>
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
