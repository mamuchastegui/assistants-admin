
import React, { useState, useEffect } from "react";
import { Conversation } from "@/hooks/useChatThreads";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface ConversationViewProps {
  conversation: Conversation | null;
  loading: boolean;
  selectedThread: string | null;
}

const ConversationView: React.FC<ConversationViewProps> = ({ 
  conversation, 
  loading, 
  selectedThread 
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, filteredMessages]);
  
  useEffect(() => {
    if (!conversation || !conversation.conversation) {
      setFilteredMessages([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredMessages(conversation.conversation);
      return;
    }

    const filtered = conversation.conversation.filter(message => 
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredMessages(filtered);
  }, [searchQuery, conversation]);

  const getInitials = (name?: string | null) => {
    if (!name) return "WA";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  if (!selectedThread) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Selecciona una conversación para ver los mensajes</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando conversación...</p>
        </div>
      </Card>
    );
  }

  if (!conversation || !conversation.conversation || conversation.conversation.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No hay mensajes en esta conversación</p>
        </div>
      </Card>
    );
  }

  const displayName = conversation.profile_name || "Usuario";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>
                {getInitials(conversation.profile_name)}
              </AvatarFallback>
            </Avatar>
            {displayName}
          </CardTitle>
          
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar..." 
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent 
        className="flex-grow overflow-hidden p-4"
        style={{
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAEZSURBVEiJ7ZW9DcIwEIXfOSRFhkBiAEZgFEZhBEZgHDZJF1KnD0XiepvYikQREvS+4nzv+ec7C/xZAtVMseGoTtprZIS9wFblEVTLXq+dAA8XocLxLGaWdYA6RPg8JZujrFbZwVXtLqDI5Zz/8n0F1D3pHqf8rYCUt/RVcWdAUdlMg6P0XUaS1jLIkzJngJ2Qm9a/AXwpGs+T9HSAN+Xsht/KVTlLr9gHAK8DLLLb3/Ib5VEUGmVWxRpHBbTovU+AXWcVxLncharKCLgBrEwdT4BjUp4B3XQUOgIK4GbyD8CaMueVOXdmFQsh9hx4FwBAwE2buXg6KNe5A1NA9fkHlU0AU6+2ack2Z4BDcpP1wBKNlmyl/FT6FNr/JC9AqrAUKy5fagAAAABJRU5ErkJggg==")`,
          backgroundColor: '#0B141A',
          backgroundRepeat: 'repeat',
        }}
      >
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {filteredMessages.map((message, index) => {
              const date = new Date(message.timestamp);
              const isUser = message.role === "user";

              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 shadow-md ${
                      isUser
                        ? "bg-[#1F2C34] text-gray-100" // Dark gray for user messages
                        : "bg-[#005C4B] text-white"    // Green for assistant messages
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        isUser ? "text-gray-400" : "text-gray-200"
                      }`}
                    >
                      {format(date, "HH:mm - d MMM", { locale: es })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t p-3 flex-shrink-0 min-h-[50px] bg-[#1F2C34]">
        {/* This area is reserved for future chat input functionality */}
      </CardFooter>
    </Card>
  );
};

export default ConversationView;
