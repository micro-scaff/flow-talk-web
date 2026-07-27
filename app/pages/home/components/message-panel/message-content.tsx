import {
  FileOutlined
} from "@ant-design/icons";
import {
  Image
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IDataMessage
} from "~/api";

import {
  isFileMessage,
  isImageMessage,
  isVideoMessage,
  readMessageText
} from "../../utils";

function formatFileSize(size?: number): string {
  if (!size || size <= 0) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function readResourceName(messageItem: IDataMessage): string {
  return typeof messageItem.content?.name === "string" && messageItem.content.name.trim()
    ? messageItem.content.name
    : "资源文件";
}

function isVideoUrl(url?: string): boolean {
  return Boolean(url && (/\.(?:mov|mp4|webm)(?:[?#].*)?$/iu).test(url));
}

function isVideoResource(messageItem: IDataMessage): boolean {
  return isVideoMessage(messageItem) ||
    (
      isFileMessage(messageItem) &&
      (messageItem.content?.type === "video" || isVideoUrl(messageItem.content?.url))
    );
}

function renderMessageContent(messageItem: IDataMessage): ReactElement {
  if (isImageMessage(messageItem)) {
    const resourceName = readResourceName(messageItem);

    return (
      <Image
        alt={resourceName}
        className="flow-message-image"
        preview={{
          mask: "预览图片"
        }}
        src={messageItem.content?.url || ""} />
    );
  }

  if (isVideoResource(messageItem)) {
    const resourceName = readResourceName(messageItem);

    const resourceUrl = messageItem.content?.url || "";

    const fileSize = typeof messageItem.content?.size === "number" ? formatFileSize(messageItem.content.size) : "";

    return (
      <div className="flow-message-video-card">
        <video
          className="flow-message-video"
          controls
          preload="metadata"
          src={resourceUrl} />

        <a
          className="flow-message-resource-link"
          href={resourceUrl}
          rel="noreferrer"
          target="_blank">
          {resourceName}
          {fileSize ? ` · ${fileSize}` : ""}
        </a>
      </div>
    );
  }

  if (isFileMessage(messageItem)) {
    const resourceName = readResourceName(messageItem);

    const resourceUrl = messageItem.content?.url || "";

    const fileSize = typeof messageItem.content?.size === "number" ? formatFileSize(messageItem.content.size) : "";

    return (
      <a
        className="flow-message-file"
        href={resourceUrl}
        rel="noreferrer"
        target="_blank">
        <span className="flow-message-file-icon">
          <FileOutlined />
        </span>

        <span className="flow-message-file-copy">
          <span className="flow-message-file-name">
            {resourceName}
          </span>

          {fileSize && (
            <span className="flow-message-file-meta">
              {fileSize}
            </span>
          )}
        </span>
      </a>
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-6">
      {readMessageText(messageItem)}
    </div>
  );
}

export { renderMessageContent };
