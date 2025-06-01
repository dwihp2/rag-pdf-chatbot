"use client";

import ChatInterface from "@/components/chat-interface";
import PDFUpload from "@/components/pdf-upload";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [showUpload, setShowUpload] = useState(true);
  
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
              onClick={() => setShowUpload(true)}
            >
              Upload PDFs
            </Button>
            <Button
              variant={!showUpload ? "default" : "outline"}
              onClick={() => setShowUpload(false)}
            >
              Chat Interface
            </Button>
          </div>
        </div>
        
        {showUpload ? <PDFUpload /> : <ChatInterface />}
      </div>
    </main>
  );
}