const DEFAULT_API_BASE_URL = "http://127.0.0.1:8080";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof configuredUrl === "string" && configuredUrl.trim()) {
    return trimTrailingSlash(configuredUrl.trim());
  }

  return DEFAULT_API_BASE_URL;
}

function toWebSocketBaseUrl(apiBaseUrl: string, browserOrigin: string): string {
  const url = new URL(apiBaseUrl || browserOrigin, browserOrigin);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

  return trimTrailingSlash(url.href);
}

function buildApiWebSocketUrl(token: string, deviceId: string): string {
  const baseUrl = toWebSocketBaseUrl(getApiBaseUrl(), window.location.origin);

  const url = new URL("/api/ws", `${baseUrl}/`);

  url.searchParams.set("token", token);
  url.searchParams.set("device_id", deviceId);

  return url.href;
}

export {
  buildApiWebSocketUrl,
  getApiBaseUrl
};
