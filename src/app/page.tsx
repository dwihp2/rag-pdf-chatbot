"use client";

import ChatSidebar from "@/components/chat-sidebar";
import PDFUpload from "@/components/pdf-upload";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus } from "lucide-react";


function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setShowUpload(searchParams.has('upload'));
  }, [searchParams]);

  const handleChatSelect = (chatId: string) => {
    setSheetOpen(false); // Close sheet on mobile
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
        setSheetOpen(false); // Close sheet on mobile
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
    <div className="container mx-auto py-6 px-4 mb-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">PDF RAG Chatbot</h1>
        <p className="text-gray-600 mt-2">
          Upload your PDFs and chat with their content
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <Tabs value={showUpload ? "upload" : "chat"} defaultValue="chat">
          <TabsList>
            <TabsTrigger value="upload" onClick={handleUploadClick}>
              Upload PDFs
            </TabsTrigger>
            <TabsTrigger value="chat" onClick={handleChatClick}>
              Chat Interface
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="max-w-7xl mx-auto">
        {showUpload ? (
          <PDFUpload />
        ) : (
          <div className="flex flex-col gap-6 h-[calc(100vh-200px)]">
            {/* Sidebar trigger for all screen sizes */}
            <div className="flex justify-start">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen} >
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4 mr-2" />
                    Chat History
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 sm:w-96 p-0 flex flex-col">
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <SheetTitle>Chat History</SheetTitle>
                      <Button
                        onClick={handleNewChat}
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Create New Chat"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden px-3 py-3">
                    <ChatSidebar
                      onChatSelect={handleChatSelect}
                      onNewChat={handleNewChat}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* New Chat Interface */}
            <div className="flex-1">
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
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </main>
  );
}