
import React, { useState, useEffect, useRef } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  X
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Conversation } from "@/hooks/useChatThreads";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
    <div className="h-full flex flex-col overflow-hidden bg-card/80 backdrop-blur-sm border-muted">
      {/* Header with profile info */}
      <div className="flex flex-row items-center justify-between p-2 sm:p-3 border-b bg-gradient-to-r from-background to-muted/30">
        <div className="flex items-center">
          {conversation && (
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-3 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">{getInitials(conversation.profile_name)}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <CardTitle className="text-sm sm:text-base line-clamp-1">
              {conversation?.profile_name || "Mensajes de WhatsApp"}
            </CardTitle>
            <CardDescription className="text-xs line-clamp-1">
              {conversation ? formatPhoneNumber(conversation.user_id) : "Conversaciones recientes con tus clientes"}
            </CardDescription>
          </div>
        </div>
        {conversation && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowSearchBox(!showSearchBox)}
            className="hover:bg-primary/10 h-7 w-7 p-0"
          >
            <Search className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>
      
      <div className="p-0 flex-grow flex flex-col h-[calc(100vh-16rem)] sm:h-[calc(100vh-15rem)] overflow-hidden relative">
        {!selectedThread ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 bg-gradient-to-br from-muted/10 to-muted/30">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <MessageSquare className="h-8 sm:h-10 w-8 sm:w-10 text-muted-foreground opacity-50 mb-3" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Selecciona una conversación para ver los mensajes
              </p>
            </motion.div>
          </div>
        ) : loadingConversation ? (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-muted/10 to-muted/30">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="h-7 w-7 animate-spin text-primary mb-3" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cargando conversación...
              </p>
            </motion.div>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {showSearchBox && (
                <motion.div 
                  className="px-2 py-1.5 sm:p-2 border-b"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar en la conversación..."
                      className="pl-7 py-1.5 h-7 bg-background/80 focus:bg-background transition-colors duration-200 text-xs"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ScrollArea className="flex-grow px-1.5 py-2 sm:py-3 bg-[url('https://i.pinimg.com/originals/85/ec/df/85ecdf1c3611ecc9b7fa85282d9526e0.jpg')] bg-cover bg-fixed bg-opacity-30 dark:bg-opacity-20 bg-blend-darken">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No hay mensajes en esta conversación
                  </p>
                </div>
              ) : (
                <div className="space-y-1 sm:space-y-1.5 px-1">
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
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-1.5 sm:p-2 border-t bg-card/90 backdrop-blur-sm">
              <div className="relative">
                <AnimatePresence>
                  {isAttachMenuOpen && (
                    <motion.div 
                      className="absolute bottom-full left-0 mb-1.5 p-1.5 bg-card rounded-lg border shadow-md grid grid-cols-3 gap-1 z-10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("imagen")}>
                        <Image className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("documento")}>
                        <Paperclip className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("audio")}>
                        <Mic className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-destructive/10" onClick={() => setIsAttachMenuOpen(false)}>
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10"
                    onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-grow bg-muted/30 border-muted focus:bg-background transition-colors duration-200 rounded-full h-7 sm:h-8 text-xs px-3 py-1.5"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10"
                    onClick={() => toast.info("Selector de emojis aún no implementado")}
                  >
                    <Smile className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    size="icon" 
                    disabled={!newMessage.trim()}
                    onClick={handleSendMessage}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary hover:bg-primary/80"
                  >
                    <SendHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-1.5 sm:p-2 ${
          isInbound
            ? "bg-background dark:bg-muted shadow-sm"
            : "bg-primary text-primary-foreground shadow-md"
        } ${
          isConsecutive 
            ? isInbound 
              ? "rounded-tl-md" 
              : "rounded-tr-md" 
            : ""
        }`}
      >
        {!isConsecutive && (
          <div className={`mb-0.5 text-xs ${
            isInbound ? "text-muted-foreground/80" : "text-primary-foreground/80"
          } font-medium`}>
            {isInbound ? profileName || "Usuario" : "Asistente"}
          </div>
        )}
        <div className="whitespace-pre-wrap text-xs sm:text-sm">{message.content}</div>
        <div
          className={`text-[10px] mt-0.5 text-right ${
            isInbound ? "text-muted-foreground/70" : "text-primary-foreground/80"
          }`}
        >
          {format(date, "HH:mm", { locale: es })}
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsAppMessages;
