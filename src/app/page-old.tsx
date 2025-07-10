'use client';

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, MessageCircle, Upload, Settings, BookOpen, Sparkles, Plus, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PDFUpload from "@/components/pdf-upload";
import DocumentManager from "@/components/document-manager";
import ChatSidebar from "@/components/chat-sidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function HomeContent() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDocumentManagerOpen, setIsDocumentManagerOpen] = useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const router = useRouter();

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });

      if (response.ok) {
        const data = await response.json();
        setIsHistorySheetOpen(false);
        router.push(`/chats/${data.chat.id}`);
      } else {
        toast.error('Failed to create new chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create new chat');
    }
  };

  const handleChatSelect = (chatId: string) => {
    setIsHistorySheetOpen(false);
    router.push(`/chats/${chatId}`);
  };

  const handleUploadComplete = () => {
    setIsUploadDialogOpen(false);
    toast.success('Document uploaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            RAG PDF Chatbot
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload your documents and chat with them using AI. Get instant answers from your PDFs with advanced RAG technology.
          </p>
        </div>

        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                Chat History
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 sm:w-96 p-0 flex flex-col">
              <div className="px-4 py-3 border-b">
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

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-500">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Start New Chat</CardTitle>
              <CardDescription>
                Begin a conversation with your uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleNewChat}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                New Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-500">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Upload Documents</CardTitle>
              <CardDescription>
                Add new PDF documents to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    Upload PDF
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload PDF Document</DialogTitle>
                  </DialogHeader>
                  <PDFUpload onUploadComplete={handleUploadComplete} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-500">
            <CardHeader className="text-center">
              <div className="mx-auto bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Manage Documents</CardTitle>
              <CardDescription>
                View and organize your uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isDocumentManagerOpen} onOpenChange={setIsDocumentManagerOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    View Documents
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Document Management</DialogTitle>
                  </DialogHeader>
                  <DocumentManager />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">PDF Processing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced PDF text extraction and chunking
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intelligent responses using RAG technology
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Chat Interface</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modern chat experience with context awareness
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Settings className="h-8 w-8 text-orange-600 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Easy Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Simple document organization and chat history
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            How to Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Upload</h3>
              <p className="text-gray-600 dark:text-gray-400">Upload your PDF documents to create a knowledge base</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Process</h3>
              <p className="text-gray-600 dark:text-gray-400">Our AI processes and indexes your documents for retrieval</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Chat</h3>
              <p className="text-gray-600 dark:text-gray-400">Ask questions and get intelligent answers from your documents</p>
            </div>
          </div>
        </div>
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