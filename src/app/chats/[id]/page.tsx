"use client";

import ModernChatInterface from "@/components/modern-chat-interface";
import ChatLayout from "@/components/chat-layout";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Source {
  filename: string;
  page: number;
  text: string;
  score?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const response = await fetch(`/api/chats/${chatId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        } else if (response.status === 404) {
          toast.error("Chat not found");
          router.push('/');
        } else {
          toast.error("Failed to load chat");
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        toast.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      loadChat();
    }
  }, [chatId, router]);

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <ChatLayout currentChatId={chatId}>
      <ModernChatInterface
        chatId={chatId}
        initialMessages={messages}
      />
    </ChatLayout>
  );
}
