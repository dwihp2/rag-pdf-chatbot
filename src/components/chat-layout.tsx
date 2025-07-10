'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import ModernSidebar from './modern-sidebar';

interface ChatLayoutProps {
  children: React.ReactNode;
  currentChatId?: string;
}

export default function ChatLayout({ children, currentChatId }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 w-full">
        <ModernSidebar currentChatId={currentChatId} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
