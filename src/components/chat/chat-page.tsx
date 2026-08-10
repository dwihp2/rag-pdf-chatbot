"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { useChatStore } from "@/hooks/use-chat-store";
import { useEffect, useMemo, useRef } from "react";

export function ChatPage({
  chatId,
  initialMessage,
}: {
  chatId: string;
  initialMessage?: string;
}) {
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        body: { chatId },
      }),
    [chatId]
  );

  const runtime = useChatRuntime({
    transport,
    messages: initialMessage
      ? [
          {
            role: "user" as const,
            id: crypto.randomUUID(),
            parts: [{ type: "text" as const, text: initialMessage }],
          },
        ]
      : undefined,
    onFinish: () => {
      // Messages are saved server-side in onEnd callback
    },
  });

  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId);
  const hasSent = useRef(false);

  useEffect(() => {
    setActiveThreadId(chatId);
  }, [chatId, setActiveThreadId]);

  useEffect(() => {
    if (initialMessage && !hasSent.current) {
      hasSent.current = true;
      // The runtime will auto-send when initialMessages are provided
    }
  }, [initialMessage]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-full">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
