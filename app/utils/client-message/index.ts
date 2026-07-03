function createClientMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server-render";
  }

  const key = "flow-talk-device-id";

  const existingDeviceId = window.localStorage.getItem(key);

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const deviceId = createClientMessageId();

  window.localStorage.setItem(key, deviceId);

  return deviceId;
}

function getDevicePlatform(): string {
  if (typeof navigator === "undefined") {
    return "web-server";
  }

  const userAgent = navigator.userAgent.toLowerCase();

  const isMobile = (/android|iphone|ipad|ipod|mobile/).test(userAgent);

  let os = "unknown";

  if (userAgent.includes("windows")) {
    os = "windows";
  } else if (userAgent.includes("mac os") || userAgent.includes("macintosh")) {
    os = "macos";
  } else if (userAgent.includes("android")) {
    os = "android";
  } else if ((/iphone|ipad|ipod/).test(userAgent)) {
    os = "ios";
  } else if (userAgent.includes("linux")) {
    os = "linux";
  }

  return `web-${isMobile ? "mobile" : "desktop"}-${os}`;
}

export {
  createClientMessageId,
  getDeviceId,
  getDevicePlatform
};
