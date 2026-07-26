import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  buildApiWebSocketUrl
} from "~/utils/api-base";

type TWebSocketStatus = "idle" | "connecting" | "open" | "closed" | "error";

interface IWebSocketEvent {
  requestId?: string;
  raw: MessageEvent["data"];
  type?: string;
  payload?: unknown;
}

interface IWebSocketHookState {
  lastEvent: IWebSocketEvent | null;
  sendJson: (payload: unknown) => boolean;
  status: TWebSocketStatus;
}

const HEARTBEAT_INTERVAL_MS = 25_000;

const RECONNECT_DELAY_MS = 2000;

function parseWsEvent(raw: MessageEvent["data"]): IWebSocketEvent {
  if (typeof raw !== "string") {
    return {
      raw
    };
  }

  try {

    // 服务端事件统一使用 { type, request_id, payload } 信封；hook 内部转成 camelCase。
    const data = JSON.parse(raw) as {
      payload?: unknown;
      ["request_id"]?: string;
      type?: string;
    };

    return {
      payload: data.payload,
      raw,
      requestId: data.request_id,
      type: data.type
    };
  } catch {
    return {
      raw
    };
  }
}

function useWebSocketHook(token: string, deviceId: string): IWebSocketHookState {

  // socket 和计时器放在 ref 中，避免重连期间触发额外渲染，也便于 cleanup 精准回收。
  const socketRef = useRef<WebSocket | null>(null);

  const reconnectTimerRef = useRef<number | null>(null);

  const heartbeatTimerRef = useRef<number | null>(null);

  const shouldReconnectRef = useRef(false);

  const [
    status,
    setStatus
  ] = useState<TWebSocketStatus>("idle");

  const [
    lastEvent,
    setLastEvent
  ] = useState<IWebSocketEvent | null>(null);

  const clearReconnectTimer = useCallback((): void => {
    if (!reconnectTimerRef.current) {
      return;
    }

    window.clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
  }, []);

  const clearHeartbeatTimer = useCallback((): void => {
    if (!heartbeatTimerRef.current) {
      return;
    }

    window.clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = null;
  }, []);

  useEffect(() => {
    if (!token || !deviceId || typeof window === "undefined") {
      return undefined;
    }

    shouldReconnectRef.current = true;

    let removeSocketListeners: (() => void) | null = null;

    // connect 会被初次连接和 close 后重连共用，因此内部每次都先清理上一条连接的副作用。
    const connect = (): void => {
      clearHeartbeatTimer();
      setStatus("connecting");
      removeSocketListeners?.();

      const socket = new WebSocket(buildApiWebSocketUrl(token, deviceId));

      socketRef.current = socket;

      const handleOpen = (): void => {
        setStatus("open");
        clearHeartbeatTimer();

        // 心跳只在 OPEN 状态发送，避免浏览器在 closing/closed 时抛异常。
        heartbeatTimerRef.current = window.setInterval(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            return;
          }

          socket.send(JSON.stringify({
            request_id: `ping-${Date.now()}`,
            type: "ping"
          }));
        }, HEARTBEAT_INTERVAL_MS);
      };

      const handleMessage = (event: MessageEvent): void => {
        const parsedEvent = parseWsEvent(event.data);

        setLastEvent(parsedEvent);
      };

      const handleClose = (): void => {
        clearHeartbeatTimer();
        setStatus("closed");

        // 主动卸载组件时 shouldReconnectRef 会被置 false，从而停止自动重连。
        if (shouldReconnectRef.current) {
          clearReconnectTimer();
          reconnectTimerRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      const handleError = (): void => {
        setStatus("error");
      };

      socket.addEventListener("open", handleOpen);
      socket.addEventListener("message", handleMessage);
      socket.addEventListener("close", handleClose);
      socket.addEventListener("error", handleError);

      removeSocketListeners = () => {
        socket.removeEventListener("open", handleOpen);
        socket.removeEventListener("message", handleMessage);
        socket.removeEventListener("close", handleClose);
        socket.removeEventListener("error", handleError);
      };
    };

    // 延迟到当前任务结束后再建立连接，避免 React 开发模式的 effect 预演立即关闭 CONNECTING socket。
    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectTimerRef.current = null;
      connect();
    }, 0);

    return () => {
      shouldReconnectRef.current = false;
      removeSocketListeners?.();
      clearHeartbeatTimer();
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [
    clearHeartbeatTimer,
    clearReconnectTimer,
    deviceId,
    token
  ]);

  const sendJson = useMemo(() => {
    return (payload: unknown): boolean => {
      if (socketRef.current?.readyState !== WebSocket.OPEN) {
        return false;
      }

      // 返回 boolean 让上层决定是否降级到 HTTP 发送消息。
      socketRef.current.send(JSON.stringify(payload));

      return true;
    };
  }, []);

  return {
    lastEvent,
    sendJson,
    status
  };
}

export { useWebSocketHook };
export type {
  IWebSocketEvent,
  IWebSocketHookState,
  TWebSocketStatus
};
