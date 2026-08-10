"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUp, Globe, Folder } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const suggestions = [
  "Summarize the key points from my documents",
  "Compare the main arguments across documents",
  "Find information about a specific topic",
  "What are the conclusions in my documents?",
];

export function ChatHome({
  collectionId,
  collectionName,
}: {
  collectionId?: string;
  collectionName?: string;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: text.substring(0, 50),
          collectionId: collectionId ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create chat");
      const chat = await res.json();
      router.push(`/chat/${chat.id}?initialMessage=${encodeURIComponent(text)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      {/* Scope indicator */}
      {collectionName ? (
        <Badge variant="secondary" className="mb-4 gap-1.5">
          <Folder className="h-3 w-3" />
          Collection: {collectionName}
        </Badge>
      ) : (
        <Badge variant="outline" className="mb-4 gap-1.5">
          <Globe className="h-3 w-3" />
          Global Chat — searches all documents
        </Badge>
      )}

      <h1 className="text-3xl font-bold mb-2">
        {collectionName ? `Ask ${collectionName}` : "What would you like to know?"}
      </h1>
      <p className="text-muted-foreground mb-8 text-center">
        {collectionName
          ? `Ask questions about documents in this collection. I'll find the answers and cite my sources.`
          : "Ask questions about your documents. I'll find the answers and cite my sources."}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            disabled={submitting}
            className="text-left p-4 rounded-lg border hover:bg-accent transition-colors text-sm disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="w-full relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything about your documents..."
          disabled={submitting}
          className="min-h-[80px] pr-12 resize-none"
        />
        <Button
          size="icon"
          disabled={!input.trim() || submitting}
          onClick={() => handleSend(input)}
          className={cn(
            "absolute right-2 bottom-2 rounded-full transition-opacity",
            !input.trim() && "opacity-50"
          )}
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}
