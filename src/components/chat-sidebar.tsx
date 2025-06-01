import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
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

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Chat' }),
      });

      if (response.ok) {
        const data = await response.json();
        setChats(prev => [data.chat, ...prev]);
        onNewChat();
        onChatSelect(data.chat.id);
      } else {
        toast.error('Failed to create new chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create new chat');
    }
  };

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
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Chat History</h3>
          <Button
            onClick={handleNewChat}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 pt-0 space-y-2">
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs text-gray-400 mt-1">Start a new conversation</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`group p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                currentChatId === chat.id 
                  ? 'bg-blue-50 border-blue-200' 
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
                        className="h-6 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-medium text-sm truncate">
                        {chat.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
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
                      className="h-6 w-6 p-0"
                      onClick={(e) => handleStartEdit(chat, e)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
