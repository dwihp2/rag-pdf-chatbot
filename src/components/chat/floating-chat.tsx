"use client";

import { useMemo } from "react";
import { MessageSquare, X } from "lucide-react";
import { AssistantModalPrimitive } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatStore } from "@/hooks/use-chat-store";
import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "./thread-list";
import { cn } from "@/lib/utils";

export function FloatingChat() {
  const isOpen = useChatStore((s) => s.isFloatingOpen);
  const openFloating = useChatStore((s) => s.openFloating);
  const closeFloating = useChatStore((s) => s.closeFloating);
  const activeThreadId = useChatStore((s) => s.activeThreadId);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        body: activeThreadId ? { chatId: activeThreadId } : {},
      }),
    [activeThreadId]
  );

  const runtime = useChatRuntime({
    transport,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <FloatingChatUI
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (open) openFloating();
          else closeFloating();
        }}
      />
    </AssistantRuntimeProvider>
  );
}

function FloatingChatUI({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const closeFloating = useChatStore((s) => s.closeFloating);
  const openFloating = useChatStore((s) => s.openFloating);

  return (
    <AssistantModalPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <AssistantModalPrimitive.Anchor className="fixed end-4 bottom-4 z-50">
        <AssistantModalPrimitive.Trigger asChild>
          <button
            onClick={() => openFloating()}
            className={cn(
              "h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center",
              isOpen && "scale-0 opacity-0 pointer-events-none"
            )}
            aria-label="Open chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>

      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="fixed z-50 bottom-20 right-4 w-[22rem] max-w-[calc(100vw-2rem)] h-[32rem] max-h-[calc(100vh-6rem)] rounded-2xl border bg-popover text-popover-foreground shadow-xl overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-2"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-sm">Assistant</h3>
          <button
            onClick={() => closeFloating()}
            className="rounded-md p-1 hover:bg-accent transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <ThreadList
              onSelect={() => {
                // keep modal open; thread switch navigates main view
              }}
            />
          </div>

          <div className="flex-1 min-h-0 border-t">
            <Thread />
          </div>
        </div>
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
}
