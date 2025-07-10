'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, Settings, Trash2, Edit3, Upload, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DocumentManager from './document-manager';
import PDFUpload from './pdf-upload';
import { formatDistanceToNow } from 'date-fns';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatGPTSidebarProps {
  currentChatId?: string;
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
  className?: string;
}

export default function ChatGPTSidebar({
  currentChatId,
  onChatSelect,
  onNewChat,
  className
}: ChatGPTSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isDocumentManagerOpen, setIsDocumentManagerOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const router = useRouter();

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

  const handleUploadComplete = () => {
    setIsUploadDialogOpen(false);
    toast.success('Document uploaded successfully!');
  };

  return (
    <div className={cn('flex flex-col h-full bg-gray-900 text-white', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-transparent border border-gray-600 hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {loading ? (
            <div className="text-center text-gray-400 py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center text-gray-400 py-4 text-sm">
              No chats yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={cn(
                  'group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors',
                  currentChatId === chat.id && 'bg-gray-800'
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {editingId === chat.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        onBlur={saveEdit}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                        autoFocus
                      />
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate text-white">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(chat);
                    }}
                    className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="h-6 w-6 p-0 hover:bg-gray-700 hover:text-red-400 text-gray-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload PDF Document</DialogTitle>
            </DialogHeader>
            <PDFUpload onUploadComplete={handleUploadComplete} />
          </DialogContent>
        </Dialog>

        <Dialog open={isDocumentManagerOpen} onOpenChange={setIsDocumentManagerOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <BookOpen className="h-4 w-4" />
              Manage Documents
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Document Management</DialogTitle>
            </DialogHeader>
            <DocumentManager />
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}
