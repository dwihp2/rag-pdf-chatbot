"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider, useAui } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { useChatStore } from "@/hooks/use-chat-store";
import { useEffect, useMemo, useRef } from "react";

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
    onFinish: () => {
      // Messages are saved server-side in onEnd callback
    },
  });

  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId);

  useEffect(() => {
    setActiveThreadId(chatId);
  }, [chatId, setActiveThreadId]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-full">
        {initialMessage && <InitialMessageSender initialMessage={initialMessage} />}
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
