'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Sparkles, Loader2, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Source {
  filename: string;
  page: number;
  text: string;
  score?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp?: string;
}

export default function ChatGPTHome() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Focus input on load
    inputRef.current?.focus();
  }, []);

  const createNewChat = async (firstMessage: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '') }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const data = await response.json();
      return data.chat.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Create new chat if this is the first message
      let chatId = currentChatId;
      if (!chatId) {
        chatId = await createNewChat(currentInput);
        setCurrentChatId(chatId);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: currentInput }],
          chatId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const data = JSON.parse(line.slice(2));
                assistantContent += data;
                // Update the assistant message in real-time
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = assistantContent;
                  } else {
                    newMessages.push({
                      id: (Date.now() + 1).toString(),
                      role: 'assistant',
                      content: assistantContent,
                      timestamp: new Date().toISOString(),
                    });
                  }
                  return newMessages;
                });
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

      // Get sources from headers if available
      const sourcesHeader = response.headers.get('X-Sources');
      let sources: Source[] = [];
      if (sourcesHeader) {
        try {
          const sourcesData = JSON.parse(sourcesHeader);
          sources = sourcesData.sources || [];
        } catch {
          console.error('Error parsing sources');
        }
      }

      // Update final message with sources
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.sources = sources;
        }
        return newMessages;
      });

      // Navigate to the chat page after first successful exchange
      if (messages.length === 0) {
        setTimeout(() => {
          router.push(`/chats/${chatId}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the user message if there was an error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionPrompts = [
    "Summarize the key points from my uploaded documents",
    "What are the main topics covered in my PDFs?",
    "Help me understand the document structure",
    "Extract important data from my files"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex flex-col items-center justify-center h-full px-4 lg:px-8 text-center">
            <div className="w-full max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  How can I help you today?
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Ask me anything about your uploaded documents. I can help you analyze, summarize, and extract insights from your PDFs.
                </p>
              </div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8 w-full max-w-3xl mx-auto">
                {suggestionPrompts.map((prompt, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-blue-300 bg-white"
                    onClick={() => handleSuggestionClick(prompt)}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-700">{prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="w-full px-4 lg:px-8 py-8">
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex w-full',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'flex gap-3 max-w-[80%]',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}>
                    {/* Avatar */}
                    <Avatar className={cn(
                      'h-8 w-8 shrink-0',
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    )}>
                      <AvatarFallback>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>

                    {/* Message Content */}
                    <div className={cn(
                      'flex flex-col gap-2',
                      message.role === 'user' ? 'items-end' : 'items-start'
                    )}>
                      <Card className={cn(
                        'relative',
                        message.role === 'user'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-gray-200'
                      )}>
                        <CardContent className="p-4">
                          <div className="prose prose-sm max-w-none text-inherit">
                            {message.content}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Timestamp */}
                      {message.timestamp && (
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 lg:p-6">
        <div className="w-full max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message RAG PDF Chatbot..."
                className="pr-12 h-12 text-base bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 h-8 w-8 p-0 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            RAG PDF Chatbot can analyze your uploaded documents and provide insights.
          </p>
        </div>
      </div>
    </div>
  );
}
