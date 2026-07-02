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

export {
  createClientMessageId,
  getDeviceId
};
