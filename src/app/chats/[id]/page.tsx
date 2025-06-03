"use client";

import ChatInterface from "@/components/chat-interface";
import ChatSidebar from "@/components/chat-sidebar";
import { Button } from "@/components/ui/button";
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

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadChat = async () => {
      try {
        const response = await fetch(`/api/chats/${chatId}`);
        if (response.ok) {
          const data = await response.json();
          setChat(data.chat);
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

  const handleChatSelect = (selectedChatId: string) => {
    router.push(`/chats/${selectedChatId}`);
  };

  const handleNewChat = () => {
    router.push('/');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">PDF RAG Chatbot</h1>
            <p className="text-gray-600 mt-2">Loading chat...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">PDF RAG Chatbot</h1>
          <p className="text-gray-600 mt-2">
            {chat ? `Chat: ${chat.title}` : "Chat with your documents"}
          </p>
        </div>
        
        <div className="mb-6 flex justify-center">
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="mr-2"
          >
            ← Back to Home
          </Button>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Chat Sidebar */}
            <div className="lg:col-span-1">
              <ChatSidebar
                currentChatId={chatId}
                onChatSelect={handleChatSelect}
                onNewChat={handleNewChat}
              />
            </div>
            
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <ChatInterface 
                chatId={chatId}
                initialMessages={messages}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
