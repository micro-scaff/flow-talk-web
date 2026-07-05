import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  API_BASE_URL
} from "~/request";

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

// 后端 WebSocket 入口挂在 /api/ws，协议需要跟随 API_BASE_URL 自动切换 ws/wss。
function buildWsUrl(token: string, deviceId: string): string {
  const url = new URL("/api/ws", API_BASE_URL);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  url.searchParams.set("device_id", deviceId);

  return url.href;
}

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

      const socket = new WebSocket(buildWsUrl(token, deviceId));

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

    connect();

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
