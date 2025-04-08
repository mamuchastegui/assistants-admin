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
  onBack?: (e: React.MouseEvent) => void;
  isMobileView?: boolean;
}

const WhatsAppMessages: React.FC<WhatsAppMessagesProps> = ({ 
  conversation, 
  loadingConversation, 
  selectedThread,
  onBack,
  isMobileView
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  
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
    toast.info(`Añadir ${type} aún no está implementada`);
    setIsAttachMenuOpen(false);
  };

  const filteredMessages = conversation?.conversation?.filter(
    msg => !searchTerm || msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden relative">
      <div 
        className="absolute inset-0 z-0 opacity-10 bg-cover bg-center filter brightness-50" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')` 
        }}
      />
      
      <div className="sticky top-0 z-10 flex flex-row items-center justify-between p-3 border-b bg-background/90 backdrop-blur-sm shadow-sm min-h-[64px]">
        {isMobileView && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2 h-8 w-8 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-3">
          {conversation && (
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20 flex-shrink-0 shadow-md">
              <AvatarFallback className="bg-primary/90 text-primary-foreground text-sm">
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
      
      <div className="flex-grow flex flex-col overflow-hidden relative z-10">
        <AnimatePresence>
          {showSearchBox && (
            <motion.div 
              className="px-3 py-2 border-b bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
          <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-gradient-to-b from-muted/5 to-muted/20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center bg-card/70 backdrop-blur-sm p-6 rounded-xl shadow-sm"
            >
              <MessageSquare className="h-10 w-10 text-primary/50 mb-4" />
              <p className="text-base font-medium text-foreground mb-2">
                ¡Bienvenido al Chat!
              </p>
              <p className="text-sm text-muted-foreground max-w-xs text-center">
                Selecciona una conversación para ver los mensajes y comenzar a chatear con tus clientes.
              </p>
            </motion.div>
          </div>
        ) : loadingConversation ? (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-muted/5 to-muted/20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center bg-card/70 backdrop-blur-sm p-6 rounded-xl shadow-sm"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-base font-medium text-foreground">
                Cargando conversación...
              </p>
            </motion.div>
          </div>
        ) : (
          <ScrollArea className="flex-grow px-4 py-6 bg-gradient-to-b from-muted/5 to-background/50 relative z-10">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <div className="bg-card/70 backdrop-blur-sm p-5 rounded-xl shadow-sm">
                  <MessageSquare className="h-8 w-8 mx-auto text-primary/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    No hay mensajes en esta conversación
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Esta conversación está vacía por el momento
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 px-2 min-h-[200px]">
                {filteredMessages.map((message, index) => (
                  <MessageItem 
                    key={index} 
                    message={message} 
                    profileName={conversation?.profile_name || ""} 
                    isConsecutive={
                      index > 0 && filteredMessages[index - 1].role === message.role
                    }
                    index={index}
                    isMobile={isMobileView || false}
                  />
                ))}
                <div ref={messagesEndRef} className="pb-6" />
              </div>
            )}
          </ScrollArea>
        )}

        {selectedThread && (
          <div className="p-3 border-t bg-card/90 backdrop-blur-sm sticky bottom-0 z-20 shadow-md">
            <div className="relative">
              <AnimatePresence>
                {isAttachMenuOpen && (
                  <motion.div 
                    className="absolute bottom-full left-0 mb-2 p-3 bg-card rounded-lg border shadow-lg grid grid-cols-3 gap-2 z-10"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("imagen")}>
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("documento")}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("audio")}>
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-full hover:bg-destructive/10 col-span-3" onClick={() => setIsAttachMenuOpen(false)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 rounded-full hover:bg-primary/10"
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow bg-background/80 border-muted focus:bg-background transition-colors duration-200 rounded-full h-9 text-sm px-4"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 rounded-full hover:bg-primary/10"
                  onClick={() => toast.info("Selector de emojis aún no implementado")}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  disabled={!newMessage.trim()}
                  onClick={handleSendMessage}
                  className="h-9 w-9 rounded-full bg-primary hover:bg-primary/80 shadow-sm"
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
      className={`flex ${isInbound ? "justify-start" : "justify-end"} mb-1.5`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl p-3 shadow-sm",
          isInbound
            ? "bg-background border border-muted/30 text-foreground"
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
            "mb-1 text-xs font-medium",
            isInbound ? "text-foreground/90" : "text-primary-foreground/90"
          )}>
            {isInbound ? profileName || "Usuario" : "Asistente"}
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        <div
          className={cn(
            "text-[10px] mt-1 text-right",
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
