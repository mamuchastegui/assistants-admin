
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="h-full flex flex-col border shadow-md bg-card/80 backdrop-blur-sm border-muted">
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-2 border-b bg-gradient-to-r from-background to-muted/30">
        <div className="flex items-center">
          {conversation && (
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">{getInitials(conversation.profile_name)}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <CardTitle className="text-base sm:text-lg line-clamp-1">
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
            className="hover:bg-primary/10 h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-0 flex-grow flex flex-col h-[calc(100vh-12rem)] sm:h-[calc(100vh-12rem)]">
        {!selectedThread ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 bg-gradient-to-br from-muted/10 to-muted/30">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <MessageSquare className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground opacity-50 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">
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
              <Loader2 className="h-8 sm:h-10 w-8 sm:w-10 animate-spin text-primary mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">
                Cargando conversación...
              </p>
            </motion.div>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {showSearchBox && (
                <motion.div 
                  className="px-3 py-2 sm:p-4 border-b"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar en la conversación..."
                      className="pl-8 bg-background/80 focus:bg-background transition-colors duration-200 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ScrollArea className="flex-grow px-2 sm:px-4 py-6 sm:py-8 bg-[url('https://i.pinimg.com/originals/85/ec/df/85ecdf1c3611ecc9b7fa85282d9526e0.jpg')] bg-cover bg-fixed">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-4 sm:py-8">
                  <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground opacity-50 mb-3 sm:mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No hay mensajes en esta conversación
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-4 px-1 sm:px-2">
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

            <div className="p-2 sm:p-3 border-t bg-card/90 backdrop-blur-sm">
              <div className="relative">
                <AnimatePresence>
                  {isAttachMenuOpen && (
                    <motion.div 
                      className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-lg border shadow-md grid grid-cols-3 gap-1 sm:gap-2 z-10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("imagen")}>
                        <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("documento")}>
                        <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10" onClick={() => handleAttachment("audio")}>
                        <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-destructive/10" onClick={() => setIsAttachMenuOpen(false)}>
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-1 sm:gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10"
                    onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                  >
                    <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-grow bg-muted/30 border-muted focus:bg-background transition-colors duration-200 rounded-full h-8 sm:h-10 text-sm px-3"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10"
                    onClick={() => toast.info("Selector de emojis aún no implementado")}
                  >
                    <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    disabled={!newMessage.trim()}
                    onClick={handleSendMessage}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary hover:bg-primary/80"
                  >
                    <SendHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-2 sm:p-3 ${
          isInbound
            ? "bg-white dark:bg-muted shadow-sm"
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
          <div className={`mb-1 text-xs ${
            isInbound ? "text-muted-foreground/80" : "text-primary-foreground/80"
          } font-medium`}>
            {isInbound ? profileName || "Usuario" : "Asistente"}
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</div>
        <div
          className={`text-xs mt-1 text-right ${
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
