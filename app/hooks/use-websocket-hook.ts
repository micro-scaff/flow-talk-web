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

    const connect = (): void => {
      clearHeartbeatTimer();
      setStatus("connecting");

      const socket = new WebSocket(buildWsUrl(token, deviceId));

      socketRef.current = socket;

      socket.addEventListener("open", () => {
        setStatus("open");
        clearHeartbeatTimer();
        heartbeatTimerRef.current = window.setInterval(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            return;
          }

          socket.send(JSON.stringify({
            request_id: `ping-${Date.now()}`,
            type: "ping"
          }));
        }, HEARTBEAT_INTERVAL_MS);
      });

      socket.addEventListener("message", event => {
        const parsedEvent = parseWsEvent(event.data);

        setLastEvent(parsedEvent);
      });

      socket.addEventListener("close", () => {
        clearHeartbeatTimer();
        setStatus("closed");

        if (shouldReconnectRef.current) {
          clearReconnectTimer();
          reconnectTimerRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
        }
      });

      socket.addEventListener("error", () => {
        setStatus("error");
      });
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;
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
