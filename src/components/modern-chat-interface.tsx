'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Kibo UI AI Components
import { AIConversation, AIConversationContent, AIConversationScrollButton } from '@/components/ui/kibo-ui/ai/conversation';
import { AIMessage, AIMessageContent, AIMessageAvatar } from '@/components/ui/kibo-ui/ai/message';
import { AIResponse } from '@/components/ui/kibo-ui/ai/response';
import { AISources, AISourcesTrigger, AISourcesContent, AISource } from '@/components/ui/kibo-ui/ai/source';
import { AIInput, AIInputTextarea, AIInputToolbar, AIInputSubmit } from '@/components/ui/kibo-ui/ai/input';

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

interface ModernChatInterfaceProps {
  chatId: string;
  initialMessages?: Message[];
}

export default function ModernChatInterface({ chatId, initialMessages = [] }: ModernChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50 dark:bg-gray-900">
      <AIConversation className="flex-1">
        <AIConversationContent>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Ask me anything about your uploaded documents. I&apos;ll help you find the information you need.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <AIMessage key={message.id} from={message.role}>
                  <AIMessageAvatar
                    src=""
                    name={message.role === 'user' ? 'U' : 'AI'}
                  />
                  <AIMessageContent>
                    {message.role === 'assistant' ? (
                      <div>
                        <AIResponse>{message.content}</AIResponse>
                        {message.sources && message.sources.length > 0 && (
                          <AISources>
                            <AISourcesTrigger count={message.sources.length} />
                            <AISourcesContent>
                              {message.sources.map((source, index) => (
                                <AISource
                                  key={index}
                                  title={`${source.filename} (p.${source.page})`}
                                  href={`#${source.filename}-${source.page}`}
                                />
                              ))}
                            </AISourcesContent>
                          </AISources>
                        )}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </AIMessageContent>
                </AIMessage>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <AIMessage from="assistant">
                  <AIMessageAvatar
                    src=""
                    name="AI"
                  />
                  <AIMessageContent>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </AIMessageContent>
                </AIMessage>
              )}
            </div>
          )}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <AIInput onSubmit={handleSendMessage}>
          <AIInputTextarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your documents..."
            disabled={isLoading}
          />
          <AIInputToolbar>
            <div></div>
            <AIInputSubmit
              disabled={!input.trim() || isLoading}
              status={isLoading ? 'streaming' : 'ready'}
            />
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  );
}
