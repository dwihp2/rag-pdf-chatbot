"use client";

import ChatInterface from "@/components/chat-interface";
import ChatSidebar from "@/components/chat-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Menu, Plus } from "lucide-react";
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
  const [sheetOpen, setSheetOpen] = useState(false);

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
    setSheetOpen(false); // Close sheet on mobile
    router.push(`/chats/${selectedChatId}`);
  };

  const handleNewChat = () => {
    setSheetOpen(false); // Close sheet on mobile
    router.push('/');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen">
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
    <main className="">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <ArrowLeft className="inline-block mr-4 cursor-pointer" onClick={handleBackToHome} />
              </TooltipTrigger>
              <TooltipContent>
                Back to Home
              </TooltipContent>
            </Tooltip>

            <h1 className="text-3xl font-bold">PDF RAG Chatbot</h1>
          </div>
          <p className="text-gray-600 mt-2">
            {chat ? `Chat: ${chat.title}` : "Chat with your documents"}
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6 h-[calc(100vh-200px)]">
            {/* Sidebar trigger for all screen sizes */}
            <div className="flex justify-start">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4 mr-2" />
                    Chat History
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 sm:w-96 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <SheetTitle>Chat History</SheetTitle>
                        <Button
                          onClick={handleNewChat}
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full p-4">
                        <ChatSidebar
                          currentChatId={chatId}
                          onChatSelect={handleChatSelect}
                          onNewChat={handleNewChat}
                        />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Chat Interface */}
            <div className="flex-1">
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
