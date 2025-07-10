'use client';

import { Suspense } from "react";
import ChatLayout from "@/components/chat-layout";
import ChatGPTHome from "@/components/chatgpt-home";

function HomeContent() {
  return (
    <ChatLayout>
      <ChatGPTHome />
    </ChatLayout>
  );
}

export default function Home() {
  return (
    <main className="h-screen overflow-hidden">
      <Suspense fallback={
        <div className="h-screen bg-gray-50 flex items-center justify-center">
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
