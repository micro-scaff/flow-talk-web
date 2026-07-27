import {
  Button,
  Space,
  Typography
} from "antd";
import type {
  ReactElement
} from "react";

import type {
  IDataMessage
} from "~/api";

import type {
  IHomeWorkbenchActions
} from "../../type";
import {
  formatDateTime,
  readMessageText
} from "../../utils";

const {
  Text
} = Typography;

interface IMessageSearchResultsProps {
  actions: IHomeWorkbenchActions;
  messages: IDataMessage[];
}

function MessageSearchResults({
  actions,
  messages
}: IMessageSearchResultsProps): ReactElement | null {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="flow-search-results border-b px-6 py-3"
      role="status">
      <Space
        className="w-full"
        orientation="vertical">
        <div className="flex items-center justify-between">
          <Text strong>
            找到
            {" "}
            {messages.length}
            {" "}
            条消息
          </Text>

          <Button
            size="small"
            type="text"
            onClick={() => {
              return actions.setSearchResults([]);
            }}>
            清空
          </Button>
        </div>

        {messages.slice(0, 5).map(item => {
          return (
            <button
              key={item.id}
              className="flow-search-result-item flex w-full items-center justify-between gap-4 text-left"
              type="button"
              onClick={() => {
                return actions.handleOpenSearchResult(item);
              }}>
              <Text ellipsis>
                {readMessageText(item)}
              </Text>

              <time>
                {formatDateTime(item.sent_at)}
              </time>
            </button>
          );
        })}
      </Space>
    </div>
  );
}

export { MessageSearchResults };
