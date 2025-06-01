import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Source = {
  filename: string;
  page: number;
  text: string;
  score?: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export default function ChatInterface() {
  const [messageSources, setMessageSources] = useState<Record<string, Source[]>>({});
  const [pendingSources, setPendingSources] = useState<Source[] | null>(null);
  
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    status,
    error,
    reload,
    stop
  } = useChat({
    api: "/api/chat",
    onResponse: async (response) => {
      if (!response.ok) {
        toast.error("Failed to get a response. Please try again.");
        return;
      }
      
      // Extract sources from response headers
      const sourcesHeader = response.headers.get("X-Sources");
      if (sourcesHeader) {
        try {
          const { sources } = JSON.parse(sourcesHeader);
          if (sources && sources.length > 0) {
            setPendingSources(sources);
          }
        } catch (error) {
          console.warn("Failed to parse sources from response:", error);
        }
      }
    },
    onFinish: (message) => {
      console.log("Message finished:", message);
      
      // Associate pending sources with the completed message
      if (pendingSources && pendingSources.length > 0) {
        setMessageSources(prev => ({
          ...prev,
          [message.id]: pendingSources
        }));
        setPendingSources(null);
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Something went wrong");
    }
  }, [error]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const renderSources = (messageId: string) => {
    const sources = messageSources[messageId];
    if (!sources || sources.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-600 mb-2">
          Sources ({sources.length}):
        </div>
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded p-2 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-700">
                  📄 {source.filename}
                </span>
                <span className="text-gray-500">Page {source.page}</span>
              </div>
              <div className="text-gray-600 leading-relaxed">
                {source.text}
              </div>
              {source.score && (
                <div className="mt-1 text-gray-400">
                  Relevance: {Math.round(source.score * 100)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[600px]">
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Ask a question about your PDFs</p>
            </div>
          ) : (
            messages.map((message) => {
              // Parse potential sources from the message object
              const parsedMessage: Message = message as Message;
              
              return (
                <div
                  key={parsedMessage.id}
                  className={`flex ${
                    parsedMessage.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      parsedMessage.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {parsedMessage.role === "assistant" && (
                      <div className="flex items-center mb-1">
                        <Avatar className="h-6 w-6 mr-2">
                          <div className="bg-gray-300 h-full w-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                              />
                            </svg>
                          </div>
                        </Avatar>
                        <span className="text-xs font-medium">Assistant</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">
                      {parsedMessage.content}
                    </div>
                    {parsedMessage.role === "assistant" && renderSources(parsedMessage.id)}
                  </div>
                </div>
              );
            })
          )}
          
          {/* Status indicators */}
          {status === 'submitted' && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {status === 'streaming' && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Generating response...</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={stop}
                    className="h-6 px-2 text-xs"
                  >
                    Stop
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Error handling */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">Something went wrong. Please try again.</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => reload()}
                    className="h-6 px-2 text-xs ml-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question about your documents..."
              className="flex-1"
              disabled={status !== 'ready'}
            />
            <Button 
              type="submit" 
              disabled={status !== 'ready' || !input.trim()}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </span>
              ) : (
                "Send"
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}