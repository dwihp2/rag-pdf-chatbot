"use client";

import ChatSidebar from "@/components/chat-sidebar";
import PDFUpload from "@/components/pdf-upload";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// interface Source {
//   filename: string;
//   page: number;
//   text: string;
//   score?: number;
// }

// interface Message {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
//   sources?: Source[];
// }

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  
  useEffect(() => {
    setShowUpload(searchParams.has('upload'));
  }, [searchParams]);
  
  const handleChatSelect = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Chat' }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/chats/${data.chat.id}`);
      } else {
        toast.error('Failed to create new chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create new chat');
    }
  };

  const handleUploadClick = () => {
    router.push('/?upload');
  };

  const handleChatClick = () => {
    router.push('/');
  };
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">PDF RAG Chatbot</h1>
          <p className="text-gray-600 mt-2">
            Upload your PDFs and chat with their content
          </p>
        </div>
        
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Button
              variant={showUpload ? "default" : "outline"}
              onClick={handleUploadClick}
              className="rounded-r-none"
            >
              Upload PDFs
            </Button>
            <Button
              variant={!showUpload ? "default" : "outline"}
              onClick={handleChatClick}
              className="rounded-l-none"
            >
              Chat Interface
            </Button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          {showUpload ? (
            <PDFUpload />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
              {/* Chat Sidebar */}
              <div className="lg:col-span-1">
                <ChatSidebar
                  onChatSelect={handleChatSelect}
                  onNewChat={handleNewChat}
                />
              </div>
              
              {/* New Chat Interface */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                      Start a New Conversation
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Select a chat from the sidebar or create a new one to begin
                    </p>
                    <Button onClick={handleNewChat}>
                      Create New Chat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}