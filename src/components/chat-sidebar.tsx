import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  currentChatId?: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({ currentChatId, onChatSelect, onNewChat }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
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

  useEffect(() => {
    fetchChats();
  }, []);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chats?id=${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
          onNewChat(); // Reset to new chat view
        }
        toast.success('Chat deleted successfully');
      } else {
        toast.error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleStartEdit = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;

    try {
      const response = await fetch(`/api/chats/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setChats(prev => prev.map(chat =>
          chat.id === editingId ? data.chat : chat
        ));
        setEditingId(null);
        setEditTitle('');
        toast.success('Chat title updated');
      } else {
        toast.error('Failed to update chat title');
      }
    } catch (error) {
      console.error('Error updating chat:', error);
      toast.error('Failed to update chat title');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse space-y-2 w-full max-w-sm">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-2">
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium">No chats yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first conversation</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`group p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm ${currentChatId === chat.id
                ? 'bg-blue-50 border-blue-200 shadow-sm'
                : 'border-gray-200'
                }`}
              onClick={() => onChatSelect(chat.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editingId === chat.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        className="h-7 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-green-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-medium text-sm truncate mb-1">
                        {chat.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatDate(chat.updatedAt)}
                      </p>
                    </>
                  )}
                </div>

                {editingId !== chat.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-blue-100"
                      onClick={(e) => handleStartEdit(chat, e)}
                    >
                      <Edit3 className="h-3 w-3 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-red-100"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
