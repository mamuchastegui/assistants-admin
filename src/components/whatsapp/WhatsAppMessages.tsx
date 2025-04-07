
import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  MessageSquare, 
  Search, 
  SendHorizontal, 
  Paperclip, 
  Smile,
  Image,
  Mic,
  X,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Conversation } from "@/hooks/useChatThreads";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
    let formatted = phoneNumber.replace("whatsapp:", "");
    return formatted;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;
    toast.info("Esta función aún no está implementada");
    setNewMessage("");
  };

  const handleAttachment = (type: string) => {
    toast.info(`Añadir ${type} aún no está implementado`);
    setIsAttachMenuOpen(false);
  };

  // Filter the conversation messages based on search term
  const filteredMessages = conversation?.conversation?.filter(
    msg => !searchTerm || msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-sm border-muted">
      {/* Header with profile info - Fixed height to prevent jumping */}
      <div className="sticky top-0 z-10 flex flex-row items-center justify-between p-3 border-b bg-gradient-to-r from-background to-muted/30 min-h-[64px]">
        {isMobile && selectedThread && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="mr-2 h-8 w-8 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-3">
          {conversation && (
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(conversation.profile_name)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold line-clamp-1 mb-0.5">
              {conversation?.profile_name || "Mensajes de WhatsApp"}
            </h2>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {conversation ? formatPhoneNumber(conversation.user_id) : "Conversaciones recientes con tus clientes"}
            </p>
          </div>
        </div>
        {conversation && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowSearchBox(!showSearchBox)}
            className="hover:bg-primary/10 h-8 w-8 p-0 flex-shrink-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-grow flex flex-col overflow-hidden relative">
        <AnimatePresence>
          {showSearchBox && (
            <motion.div 
              className="px-3 py-2 border-b"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar en la conversación..."
                  className="pl-7 py-1.5 h-8 bg-background/80 focus:bg-background transition-colors duration-200 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedThread ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-gradient-to-br from-muted/10 to-muted/30">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <MessageSquare className="h-8 w-8 text-muted-foreground opacity-50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Selecciona una conversación para ver los mensajes
              </p>
            </motion.div>
          </div>
        ) : loadingConversation ? (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-muted/10 to-muted/30">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="h-7 w-7 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                Cargando conversación...
              </p>
            </motion.div>
          </div>
        ) : (
          <ScrollArea className="flex-grow px-3 py-4 bg-cover bg-center" style={{ backgroundImage: 'url(https://i.pinimg.com/736x/fa/a0/a3/faa0a376d7af8ed314dc66f517554a53.jpg)' }}>
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <MessageSquare className="h-6 w-6 mx-auto text-foreground opacity-50 mb-2" />
                <p className="text-sm text-foreground bg-background/50 px-3 py-1 rounded-md">
                  No hay mensajes en esta conversación
                </p>
              </div>
            ) : (
              <div className="space-y-2 px-2 min-h-[200px]">
                {filteredMessages.map((message, index) => (
                  <MessageItem 
                    key={index} 
                    message={message} 
                    profileName={conversation?.profile_name || ""} 
                    isConsecutive={
                      index > 0 && filteredMessages[index - 1].role === message.role
                    }
                    index={index}
                    isMobile={isMobile}
                  />
                ))}
                <div ref={messagesEndRef} className="pb-4" />
              </div>
            )}
          </ScrollArea>
        )}

        {selectedThread && (
          <div className="p-3 border-t bg-card/90 backdrop-blur-sm sticky bottom-0 z-10">
            <div className="relative">
              <AnimatePresence>
                {isAttachMenuOpen && (
                  <motion.div 
                    className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-lg border shadow-md grid grid-cols-3 gap-1.5 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("imagen")}>
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("documento")}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("audio")}>
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10" onClick={() => setIsAttachMenuOpen(false)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-full hover:bg-primary/10"
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow bg-muted/30 border-muted focus:bg-background transition-colors duration-200 rounded-full h-8 text-sm px-3"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-full hover:bg-primary/10"
                  onClick={() => toast.info("Selector de emojis aún no implementado")}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  disabled={!newMessage.trim()}
                  onClick={handleSendMessage}
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/80"
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface MessageItemProps {
  message: WhatsAppMessage;
  profileName: string;
  isConsecutive: boolean;
  index: number;
  isMobile: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, profileName, isConsecutive, index, isMobile }) => {
  const isInbound = message.role === "user";
  const date = new Date(message.timestamp);
  
  return (
    <motion.div 
      className={`flex ${isInbound ? "justify-start" : "justify-end"} mb-1`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl p-2.5 shadow-sm",
          isInbound
            ? "bg-background/85 backdrop-blur-sm text-foreground"
            : "bg-primary/90 backdrop-blur-sm text-primary-foreground",
          isConsecutive 
            ? isInbound 
              ? "rounded-tl-md" 
              : "rounded-tr-md" 
            : ""
        )}
      >
        {!isConsecutive && (
          <div className={cn(
            "mb-0.5 text-xs font-medium",
            isInbound ? "text-foreground/90" : "text-primary-foreground/90"
          )}>
            {isInbound ? profileName || "Usuario" : "Asistente"}
          </div>
        )}
        <div className="whitespace-pre-wrap text-xs">{message.content}</div>
        <div
          className={cn(
            "text-[10px] mt-0.5 text-right",
            isInbound ? "text-foreground/70" : "text-primary-foreground/80"
          )}
        >
          {format(date, "HH:mm", { locale: es })}
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsAppMessages;
