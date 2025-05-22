
import React, { useRef, useEffect } from "react";
import { ChatMessage } from "@/hooks/useChatThreads";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface PendingMessage {
  id: string;
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: ChatMessage[];
  pendingMessages: PendingMessage[];
  isWaitingForResponse: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  pendingMessages,
  isWaitingForResponse
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, pendingMessages]);

  // Combine real and pending messages
  const allMessages = [
    ...messages,
    ...pendingMessages.map(msg => ({
      role: "assistant" as const,
      content: msg.content,
      timestamp: msg.timestamp,
      isPending: true
    }))
  ];

  return (
    <div 
      className="flex-grow overflow-hidden p-4"
      style={{
        backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAEZSURBVEiJ7ZW9DcIwEIXfOSRFhkBiAEZgFEZhBEZgHDZJF1KnD0XiepvYikQREvS+4nzv+ec7C/xZAtVMseGoTtprZIS9wFblEVTLXq+dAA8XocLxLGaWdYA6RPg8JZujrFbZwVXtLqDI5Zz/8n0F1D3pHqf8rYCUt/RVcWdAUdlMg6P0XUaS1jLIkzJngJ2Qm9a/AXwpGs+T9HSAN+Xsht/KVTlLr9gHAK8DLLLb3/Ib5VEUGmVWxRpHBbTovU+AXWcVxLncharKCLgBrEwdT4BjUp4B3XQUOgIK4GbyD8CaMueVOXdmFQsh9hx4FwBAwE2buXg6KNe5A1NA9fkHlU0AU6+2ack2Z4BDcpP1wBKNlmyl/FT6FNr/JC9AqrAUKy5fagAAAABJRU5ErkJggg==")`,
        backgroundColor: '#0B141A',
        backgroundRepeat: 'repeat',
      }}
      ref={scrollAreaRef}
    >
      <ScrollArea className="h-full pr-4">
        <div className="space-y-4 pb-4">
          {allMessages.map((message, index) => (
            <MessageBubble
              key={index}
              content={message.content}
              timestamp={message.timestamp}
              isUser={message.role === "user"}
              isPending={'isPending' in message && message.isPending}
            />
          ))}
          <div ref={messagesEndRef} />
          
          {/* Show waiting for response indicator */}
          {isWaitingForResponse && (
            <div className="flex flex-col items-center justify-center py-2 px-4">
              <div className="text-xs text-gray-300 mb-1">Esperando respuesta...</div>
              <Progress 
                className="h-1 w-36 bg-gray-700" 
                value={100} 
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
