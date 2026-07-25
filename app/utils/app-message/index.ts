import type {
  MessageInstance
} from "antd/es/message/interface";

const messageHolder: {
  current: MessageInstance | null;
} = {
  current: null
};

function getAppMessage(): MessageInstance | null {
  return messageHolder.current;
}

function setAppMessage(instance: MessageInstance | null): void {
  messageHolder.current = instance;
}

export {
  getAppMessage,
  setAppMessage
};
