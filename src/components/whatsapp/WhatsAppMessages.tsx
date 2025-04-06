
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Search, SendHorizontal, Paperclip, Smile } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Conversation } from "@/hooks/useChatThreads";

interface WhatsAppMessage {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface WhatsAppMessagesProps {
  conversation: Conversation | null;
  loadingConversation: boolean;
  selectedThread: string | null;
}

const WhatsAppMessages: React.FC<WhatsAppMessagesProps> = ({ 
  conversation, 
  loadingConversation, 
  selectedThread 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);
  
  const getInitials = (name?: string): string => {
    if (!name) return "WA";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };
  
  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove "whatsapp:" prefix if it exists
    let formatted = phoneNumber.replace("whatsapp:", "");
    // Format as +XX XXX XXX XXX
    return formatted;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;
    
    // In a real implementation, this would send the message to the API
    toast.info("Esta función aún no está implementada");
    setNewMessage("");
  };

  // Filter the conversation messages based on search term
  const filteredMessages = conversation?.conversation?.filter(
    msg => !searchTerm || msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card className="h-full flex flex-col border shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <div className="flex items-center">
          {conversation && (
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback>{getInitials(conversation.profile_name)}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <CardTitle className="text-lg">
              {conversation?.profile_name || "Mensajes de WhatsApp"}
            </CardTitle>
            <CardDescription className="text-xs">
              {conversation ? formatPhoneNumber(conversation.user_id) : "Conversaciones recientes con tus clientes"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow flex flex-col h-[calc(100vh-12rem)]">
        {!selectedThread ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground mb-2">
              Selecciona una conversación para ver los mensajes
            </p>
          </div>
        ) : loadingConversation ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Cargando conversación...
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en la conversación..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-grow p-4">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">
                    No hay mensajes en esta conversación
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((message, index) => (
                    <MessageItem key={index} message={message} profileName={conversation?.profile_name || ""} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <Button size="icon" variant="ghost">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button 
                  size="icon" 
                  disabled={!newMessage.trim()}
                  onClick={handleSendMessage}
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface MessageItemProps {
  message: WhatsAppMessage;
  profileName: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, profileName }) => {
  const isInbound = message.role === "user";
  const date = new Date(message.timestamp);
  
  return (
    <div className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isInbound
            ? "bg-muted"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {!isInbound && (
          <div className="mb-1 text-xs text-primary-foreground/80 font-medium">
            Asistente
          </div>
        )}
        {isInbound && (
          <div className="mb-1 text-xs text-muted-foreground/80 font-medium">
            {profileName || "Usuario"}
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            isInbound ? "text-muted-foreground" : "text-primary-foreground/80"
          }`}
        >
          {format(date, "HH:mm", { locale: es })}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMessages;
