"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider, useAui } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { useChatStore } from "@/hooks/use-chat-store";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { UIMessage } from "ai";

/**
 * Loads historical messages into the thread on mount.
 * Polls until the AI SDK runtime (useChat) is ready, then appends
 * messages without triggering runs.
 */
function ChatInitializer({ messages }: { messages: UIMessage[] }) {
  const aui = useAui();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;

    let attempts = 0;
    const maxAttempts = 50;

    const tryInit = () => {
      if (done.current) return;

      if (aui.thread.source == null) {
        attempts++;
        if (attempts < maxAttempts) setTimeout(tryInit, 100);
        return;
      }

      const state = aui.thread.getState();
      if (state.messages.length > 0) {
        done.current = true;
        return;
      }

      done.current = true;

      for (const msg of messages) {
        aui.thread.append({
          role: msg.role as "user" | "assistant",
          content: (msg.parts ?? []) as never,
          startRun: false,
        });
      }
    };

    tryInit();

    return () => {
      done.current = true;
    };
  }, [messages]);

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
        <ChatInitializer messages={historyMessages} />
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
