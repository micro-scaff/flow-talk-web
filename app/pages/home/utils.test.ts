import assert from "node:assert/strict";
import test from "node:test";

import type {
  IDataConversationListItem,
  IDataMessage
} from "~/api";

import {
  hasMessage,
  replaceSendingMessage,
  shouldRefreshForRealtimeMessage,
  updateConversationSummary
} from "./utils";

function createMessage(overrides?: Partial<IDataMessage>): IDataMessage {
  return {
    client_msg_id: "client-1",
    content: {
      text: "hello"
    },
    conversation_id: 1,
    id: 10,
    message_type: "text",
    sender_id: 2,
    sent_at: "2026-07-03T10:00:00+08:00",
    status: "normal",
    ...overrides
  };
}

function createConversation(overrides?: Partial<IDataConversationListItem>): IDataConversationListItem {
  return {
    id: 1,
    title: "会话",
    type: "direct",
    unread_count: 0,
    ...overrides
  };
}

void test("updates conversation summary locally for latest realtime message", () => {
  const message = createMessage();

  const conversations = [
    createConversation(),
    createConversation({
      id: 2,
      title: "其他会话"
    })
  ];

  const nextConversations = updateConversationSummary(conversations, message, {
    activeConversationId: null,
    currentUserId: 1
  });

  assert.equal(nextConversations[0]?.last_message_id, message.id);
  assert.deepEqual(nextConversations[0]?.last_message, message);
  assert.equal(nextConversations[0]?.last_message_at, message.sent_at);
  assert.equal(nextConversations[0]?.unread_count, 1);
  assert.equal(nextConversations[1]?.last_message_id, undefined);
});

void test("does not increment unread count for active conversation or current user's message", () => {
  const activeResult = updateConversationSummary([
    createConversation()
  ], createMessage({
    sender_id: 2
  }), {
    activeConversationId: 1,
    currentUserId: 1
  });

  const ownResult = updateConversationSummary([
    createConversation()
  ], createMessage({
    sender_id: 1
  }), {
    activeConversationId: null,
    currentUserId: 1
  });

  assert.equal(activeResult[0]?.unread_count, 0);
  assert.equal(ownResult[0]?.unread_count, 0);
});

void test("skips refresh when deliver repeats a message already merged by ack", () => {
  const ackMessage = createMessage();

  assert.equal(hasMessage([
    ackMessage
  ], createMessage({
    id: 10
  })), true);
  assert.equal(shouldRefreshForRealtimeMessage("message.ack", ackMessage, [
    ackMessage
  ]), false);
  assert.equal(shouldRefreshForRealtimeMessage("message.deliver", createMessage({
    client_msg_id: "client-1",
    id: 10
  }), [
    ackMessage
  ]), false);
  assert.equal(shouldRefreshForRealtimeMessage("message.deliver", createMessage({
    client_msg_id: "client-2",
    id: 11
  }), [
    ackMessage
  ]), true);
});

void test("ack only replaces matching sending message", () => {
  const sendingMessage = createMessage({
    id: -1,
    status: "sending"
  });

  const ackMessage = createMessage({
    id: 10,
    status: "normal"
  });

  const unrelatedAckMessage = createMessage({
    client_msg_id: "client-2",
    id: 11,
    status: "normal"
  });

  assert.deepEqual(replaceSendingMessage([
    sendingMessage
  ], ackMessage), [
    ackMessage
  ]);
  assert.deepEqual(replaceSendingMessage([
    ackMessage
  ], unrelatedAckMessage), [
    ackMessage
  ]);
});
