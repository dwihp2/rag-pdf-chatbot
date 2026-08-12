"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useSession } from "@/lib/auth";
import { AuthInterceptor } from "@/components/auth/auth-interceptor";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ChatHome } from "@/components/chat/chat-home";
import { FloatingChat } from "@/components/chat/floating-chat";

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-6">
        <MessageSquare className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-3 text-center">DeptQ</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
        Q&A for every department. Upload PDFs, ask questions, get cited answers.
      </p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Create Account</Button>
        </Link>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

export default function HomePage() {
  const { data: session, isPending } = useSession();

  if (isPending) return <LoadingSpinner />;

  if (!session) return <LandingPage />;

  return (
    <div className="flex h-screen">
      <AuthInterceptor />
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <ChatHome />
      </main>
      <FloatingChat />
    </div>
  );
}
