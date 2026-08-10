"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export function ThreadList({ onSelect }: { onSelect?: (id: string) => void }) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/chats")
      .then((r) => r.json())
      .then((data) => {
        setChats(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id: string) => {
    setActiveThreadId(id);
    onSelect?.(id);
    router.push(`/chat/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeThreadId === id) setActiveThreadId(null);
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No conversations yet. Start one!
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => handleSelect(chat.id)}
          className={cn(
            "group flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-colors",
            activeThreadId === chat.id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="h-3 w-3 shrink-0" />
            <span className="truncate">{chat.title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
            onClick={(e) => handleDelete(e, chat.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
