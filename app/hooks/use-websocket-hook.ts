import {
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
  raw: MessageEvent["data"];
  type?: string;
  payload?: unknown;
}

interface IWebSocketHookState {
  lastEvent: IWebSocketEvent | null;
  sendJson: (payload: unknown) => void;
  status: TWebSocketStatus;
}

function buildWsUrl(token: string, deviceId: string): string {
  const url = new URL("/ws", API_BASE_URL);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  url.searchParams.set("device_id", deviceId);

  return url.toString();
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
      type?: string;
    };

    return {
      payload: data.payload,
      raw,
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

  const [
    status,
    setStatus
  ] = useState<TWebSocketStatus>("idle");

  const [
    lastEvent,
    setLastEvent
  ] = useState<IWebSocketEvent | null>(null);

  useEffect(() => {
    if (!token || !deviceId || typeof window === "undefined") {
      return undefined;
    }

    setStatus("connecting");

    const socket = new WebSocket(buildWsUrl(token, deviceId));

    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setStatus("open");
    });

    socket.addEventListener("message", event => {
      const parsedEvent = parseWsEvent(event.data);

      setLastEvent(parsedEvent);

      if (parsedEvent.type === "ping") {
        socket.send(JSON.stringify({
          type: "pong"
        }));
      }
    });

    socket.addEventListener("close", () => {
      setStatus("closed");
    });

    socket.addEventListener("error", () => {
      setStatus("error");
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [
    deviceId,
    token
  ]);

  const sendJson = useMemo(() => {
    return (payload: unknown): void => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
      }
    };
  }, []);

  return {
    lastEvent,
    sendJson,
    status
  };
}

export {
  useWebSocketHook
};
export type {
  IWebSocketEvent,
  IWebSocketHookState,
  TWebSocketStatus
};
