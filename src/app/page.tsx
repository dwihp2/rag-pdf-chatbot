import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-6">
        <MessageSquare className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-3 text-center">RAG Chat</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
        Upload PDFs, ask questions, get cited answers. Your documents, made conversational.
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
