"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider, useAui } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { useChatStore } from "@/hooks/use-chat-store";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { UIMessage } from "ai";

function InitialMessageSender({ initialMessage }: { initialMessage: string }) {
  const aui = useAui();
  const hasSent = useRef(false);

  useEffect(() => {
    if (hasSent.current) return;
    if (aui.thread.source == null) return;

    const state = aui.thread.getState();
    const alreadyHasUserMessage = state.messages.some((m) => m.role === "user");
    if (alreadyHasUserMessage) return;

    hasSent.current = true;
    aui.thread.append({
      role: "user",
      content: [{ type: "text", text: initialMessage }],
    });
    aui.thread.startRun({ parentId: null });
  }, [aui, initialMessage]);

  return null;
}

/**
 * Loads historical messages by appending them to the thread without parentId.
 * We avoid parentId because the AI SDK message store (managed by useChat) does
 * not have these historical IDs, and setting parentId triggers sliceMessagesUntil
 * which would fail. The thread displays messages in append order regardless.
 */
function HistoryLoader({ messages }: { messages: UIMessage[] }) {
  const aui = useAui();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    if (messages.length === 0) return;

    let attempts = 0;
    const maxAttempts = 50;

    const tryLoad = () => {
      if (loaded.current) return;

      if (aui.thread.source == null) {
        attempts++;
        if (attempts < maxAttempts) setTimeout(tryLoad, 100);
        return;
      }

      const state = aui.thread.getState();
      if (state.messages.length > 0) {
        loaded.current = true;
        return;
      }

      loaded.current = true;

      for (const msg of messages) {
        aui.thread.append({
          role: msg.role as "user" | "assistant",
          content: msg.parts ?? [],
          startRun: false,
        });
      }
    };

    tryLoad();

    return () => {
      loaded.current = true;
    };
  }, [aui, messages]);

  return null;
}

export function ChatPage({
  chatId,
  initialMessage,
}: {
  chatId: string;
  initialMessage?: string;
}) {
  const [historyMessages, setHistoryMessages] = useState<UIMessage[] | null>(null);
  const [historyError, setHistoryError] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?chatId=${encodeURIComponent(chatId)}`);
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setHistoryMessages(data.messages ?? []);
    } catch {
      setHistoryError(true);
      setHistoryMessages([]);
    }
  }, [chatId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on chatId change
  useEffect(() => {
    setHistoryMessages(null);
    setHistoryError(false);
    fetchHistory();
  }, [fetchHistory]);

  // Show loading while fetching history
  if (historyMessages === null && !historyError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <ChatPageInner
      key={chatId}
      chatId={chatId}
      initialMessage={initialMessage}
      historyMessages={historyMessages ?? []}
    />
  );
}

function ChatPageInner({
  chatId,
  initialMessage,
  historyMessages,
}: {
  chatId: string;
  initialMessage?: string;
  historyMessages: UIMessage[];
}) {
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        body: { chatId },
      }),
    [chatId]
  );

  const runtime = useChatRuntime({ transport });

  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId);

  useEffect(() => {
    setActiveThreadId(chatId);
  }, [chatId, setActiveThreadId]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-full">
        <HistoryLoader messages={historyMessages} />
        {initialMessage && <InitialMessageSender initialMessage={initialMessage} />}
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
