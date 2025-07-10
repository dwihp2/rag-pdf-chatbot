'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { MessageSquare, Plus, Settings, Trash2, Edit3, FileText, Home } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ModernSidebarProps {
  currentChatId?: string;
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
  className?: string;
}

function ModernSidebarContent({
  currentChatId,
  onChatSelect,
  onNewChat,
  className
}: ModernSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      } else {
        toast.error('Failed to load chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });

      if (response.ok) {
        const data = await response.json();
        setChats(prev => [data.chat, ...prev]);
        if (onNewChat) onNewChat();
        if (onChatSelect) onChatSelect(data.chat.id);
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
    if (onChatSelect) onChatSelect(chatId);
    router.push(`/chats/${chatId}`);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        toast.success('Chat deleted successfully');

        // If we deleted the current chat, redirect to home
        if (currentChatId === chatId) {
          router.push('/');
        }
      } else {
        toast.error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleUpdateChat = async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });

      if (response.ok) {
        setChats(prev => prev.map(chat =>
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        ));
        toast.success('Chat renamed successfully');
      } else {
        toast.error('Failed to rename chat');
      }
    } catch (error) {
      console.error('Error updating chat:', error);
      toast.error('Failed to rename chat');
    }
  };

  const startEditing = (chat: Chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEdit = async () => {
    if (editingId && editTitle.trim()) {
      await handleUpdateChat(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const navigationItems = [
    {
      title: 'Home',
      icon: Home,
      href: '/',
      isActive: pathname === '/',
    },
    {
      title: 'Documents',
      icon: FileText,
      href: '/documents',
      isActive: pathname === '/documents',
    },
  ];

  return (
    <Sidebar className={cn('border-r border-gray-200 dark:border-gray-700', className)}>
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {state === 'expanded' && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                RAG PDF Chat
              </h2>
            )}
          </div>
          <SidebarTrigger className="p-1" />
        </div>

        {state === 'expanded' && (
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 mt-4"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="flex flex-col">
        {/* Navigation */}
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={item.isActive}
                  onClick={() => router.push(item.href)}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {state === 'expanded' && item.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          {state === 'expanded' && (
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
              Recent Chats
            </div>
          )}

          <SidebarMenu>
            {loading ? (
              <div className="text-center text-gray-400 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
                {state === 'expanded' && <div className="mt-2 text-sm">Loading chats...</div>}
              </div>
            ) : chats.length === 0 ? (
              state === 'expanded' && (
                <div className="text-center text-gray-400 py-4">
                  <div className="text-sm">No chats yet</div>
                  <div className="text-xs mt-1">Start a new conversation!</div>
                </div>
              )
            ) : (
              chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <div className="flex items-center gap-1 group">
                    <SidebarMenuButton
                      isActive={currentChatId === chat.id}
                      onClick={() => handleChatSelect(chat.id)}
                      className="flex-1 justify-start"
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      {state === 'expanded' && (
                        <>
                          {editingId === chat.id ? (
                            <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                onBlur={saveEdit}
                                className="h-6 text-sm"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex-1 min-w-0">
                              <div className="truncate text-sm">
                                {chat.title}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </SidebarMenuButton>

                    {state === 'expanded' && editingId !== chat.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(chat);
                          }}
                          className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded flex items-center justify-center"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {state === 'expanded' && (
                    <div className="px-6 py-1">
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                      </div>
                    </div>
                  )}
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-700 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push('/settings')}
              className="w-full justify-start gap-2"
            >
              <Settings className="h-4 w-4" />
              {state === 'expanded' && 'Settings'}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function ModernSidebar(props: ModernSidebarProps) {
  return <ModernSidebarContent {...props} />;
}
