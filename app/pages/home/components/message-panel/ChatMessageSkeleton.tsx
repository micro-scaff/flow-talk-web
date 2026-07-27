import type {
  ReactElement
} from "react";

const skeletonRows = [
  {
    align: "peer",
    id: "peer-opening",
    lines: [
      [
        "peer-opening-primary",
        "44%"
      ],
      [
        "peer-opening-secondary",
        "62%"
      ]
    ]
  },
  {
    align: "mine",
    id: "mine-opening",
    lines: [
      [
        "mine-opening-primary",
        "38%"
      ]
    ]
  },
  {
    align: "peer",
    id: "peer-detail",
    lines: [
      [
        "peer-detail-primary",
        "56%"
      ],
      [
        "peer-detail-secondary",
        "48%"
      ],
      [
        "peer-detail-tertiary",
        "30%"
      ]
    ]
  },
  {
    align: "mine",
    id: "mine-detail",
    lines: [
      [
        "mine-detail-primary",
        "52%"
      ],
      [
        "mine-detail-secondary",
        "34%"
      ]
    ]
  }
] as const;

function ChatMessageSkeleton(): ReactElement {
  return (
    <div
      aria-label="正在加载流言"
      className="flow-chat-skeleton"
      role="status">
      {skeletonRows.map(row => {
        const isMine = row.align === "mine";

        return (
          <div
            key={row.id}
            className={`flow-chat-skeleton-row ${isMine ? "is-mine" : "is-peer"}`}>
            {!isMine && (
              <span className="flow-chat-skeleton-avatar" />
            )}

            <span className="flow-chat-skeleton-bubble">
              <span className="flow-chat-skeleton-meta" />

              {row.lines.map(([
                id,
                width
              ]) => {
                return (
                  <span
                    key={id}
                    className="flow-chat-skeleton-line"
                    style={{
                      width
                    }} />
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { ChatMessageSkeleton };
