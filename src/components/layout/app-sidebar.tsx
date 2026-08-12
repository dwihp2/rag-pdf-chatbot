"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, FileText, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ThreadList } from "@/components/chat/thread-list";

const navItems = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/collections", label: "Collections", icon: FolderOpen },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r h-screen flex flex-col">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">DeptQ</span>
        </div>

        <Link href="/" className="block mb-4">
          <Button className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Chat history — scrollable list */}
      <div className="flex-1 overflow-y-auto border-t mx-3 py-2">
        <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          History
        </p>
        <ThreadList />
      </div>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => signOut()}
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
