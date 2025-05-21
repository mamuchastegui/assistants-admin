import React, { useState, useEffect, useRef } from "react";
import { Conversation } from "@/hooks/useChatThreads";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, MessageSquare, Search, Paperclip, Send, Image, Mic, Smile, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useConversationActions } from "@/hooks/useConversationActions";
import ThreadStatusSelector from "./ThreadStatusSelector";
import { Badge } from "@/components/ui/badge";
import QuickResponses from "./QuickResponses";
import { useAuth0 } from '@auth0/auth0-react';

interface ConversationViewProps {
  conversation: Conversation | null;
  loading: boolean;
  selectedThread: string | null;
  assistantId: string | null;
  currentThreadStatus?: string;
  onStatusChange?: (threadId: string, status: string) => Promise<boolean>;
}

const ConversationView: React.FC<ConversationViewProps> = ({ 
  conversation, 
  loading, 
  selectedThread,
  assistantId,
  currentThreadStatus = "new",
  onStatusChange
}) => {
  const { user } = useAuth0();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const previousMessageCount = useRef<number>(0);
  const initialLoadComplete = useRef<boolean>(false);
  
  // Use the conversation actions hook
  const { sendMessage, uploadFile, sendAudio, isSending, isUploading } = useConversationActions({
    threadId: selectedThread,
    assistantId: assistantId
  });

  // Initial scroll to bottom when conversation loads
  useEffect(() => {
    if (conversation && conversation.conversation && !initialLoadComplete.current) {
      // Use setTimeout to ensure DOM has been updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        initialLoadComplete.current = true;
      }, 100);
    }
    
    // Reset the initialLoadComplete ref when thread changes
    return () => {
      initialLoadComplete.current = false;
    };
  }, [selectedThread, conversation]);

  // Intelligently handle scrolling when new messages arrive
  useEffect(() => {
    if (!conversation || !conversation.conversation) return;
    
    const currentMessageCount = conversation.conversation.length;
    
    // Only scroll to bottom in these cases:
    // 1. Initial load (previousMessageCount is 0)
    // 2. We sent a message (so we need to see the reply)
    // 3. New messages came in and we're already at the bottom
    const shouldScrollToBottom = 
      previousMessageCount.current === 0 || 
      currentMessageCount > previousMessageCount.current;
    
    if (shouldScrollToBottom && messagesEndRef.current) {
      // Use a small timeout to ensure the DOM has updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    
    // Update the previous count
    previousMessageCount.current = currentMessageCount;
  }, [conversation]);
  
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

  const handleStatusChange = async (status: string) => {
    if (!selectedThread || !onStatusChange) return;
    
    setIsChangingStatus(true);
    try {
      const success = await onStatusChange(selectedThread, status);
      if (!success) {
        toast.error("No se pudo actualizar el estado");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Error al cambiar el estado");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !isRecording) return;
    
    if (isRecording) {
      // Handle recording scenario
      toggleRecording();
      return;
    }
    
    const messageContent = message.trim();
    setMessage(""); // Clear the input field immediately for better UX
    
    try {
      const result = await sendMessage(messageContent);
      
      if (result) {
        // Message sent successfully, no need for additional toast as the message 
        // will appear in the conversation
        console.log("Message sent successfully:", result);
      } else {
        toast.error("No se pudo enviar el mensaje");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar el mensaje");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const fileUrl = await uploadFile(files[0]);
        if (fileUrl) {
          console.log("File uploaded successfully:", fileUrl);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Error al subir el archivo");
      }
    }
  };

  const toggleRecording = async () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Grabando audio...");
      // Start recording logic would go here
    } else {
      // In a real implementation, you would capture the audio blob
      // For now, we'll simulate with a dummy blob
      try {
        const dummyBlob = new Blob(["dummy audio data"], { type: "audio/wav" });
        const result = await sendAudio(dummyBlob);
        if (result) {
          toast.success("Audio enviado");
        }
      } catch (error) {
        console.error("Error sending audio:", error);
        toast.error("Error al enviar el audio");
      }
    }
  };

  const handleQuickResponse = (responseText: string) => {
    setMessage(responseText);
    // Focus the input after setting the response
    const inputElement = document.querySelector('input[placeholder="Escribe un mensaje"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "WA";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  const STATUS_LABELS: { [key: string]: string } = {
    "new": "Nuevo",
    "bot_handling": "Bot atendiendo",
    "human_needed": "Requiere atención",
    "human_answering": "Respondiendo",
    "waiting_user": "Esperando usuario",
    "resolved": "Resuelto",
    "error": "Error",
    "archived": "Archivado",
    "expired": "Expirado"
  };

  if (!selectedThread || !assistantId) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {!assistantId 
              ? "Por favor selecciona un asistente para ver las conversaciones" 
              : "Selecciona una conversación para ver los mensajes"
            }
          </p>
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
  const currentUserName = user?.name || "Asistente";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b flex-shrink-0">
        <div className="flex flex-col space-y-2">
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

          {/* Status Badge and selector prominently displayed */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado:</span>
              <Badge variant="outline" className="font-semibold">
                {STATUS_LABELS[currentThreadStatus] || currentThreadStatus}
              </Badge>
            </div>
            
            {/* Status selector with better visibility */}
            {onStatusChange && (
              <div className="w-56">
                <ThreadStatusSelector
                  currentStatus={currentThreadStatus}
                  onStatusChange={handleStatusChange}
                  disabled={isChangingStatus}
                />
              </div>
            )}
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
        ref={scrollAreaRef}
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
      
      <CardFooter className="border-t p-0 flex-shrink-0 min-h-[60px] bg-[#1F2C34]">
        <div className="flex items-center w-full px-2 py-1">
          <div className="flex items-center space-x-3 text-gray-400 px-2">
            <Smile 
              className="h-6 w-6 cursor-pointer hover:text-gray-200 transition-colors" 
              onClick={() => toast.info("Emoji selector")}
            />
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,audio/*,application/*"
              />
              <Paperclip 
                className="h-6 w-6 cursor-pointer hover:text-gray-200 transition-colors" 
                onClick={handleFileSelect}
              />
            </div>
            <Image 
              className="h-6 w-6 cursor-pointer hover:text-gray-200 transition-colors" 
              onClick={() => {
                fileInputRef.current?.click();
                fileInputRef.current?.setAttribute('accept', 'image/*');
              }}
            />
            <QuickResponses 
              onSelectResponse={handleQuickResponse} 
              profileName={conversation.profile_name}
              currentUserName={currentUserName}
            />
          </div>

          <div className="flex-grow mx-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje"
              className="bg-[#2A3942] border-0 text-gray-100 placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isSending || isUploading}
            />
          </div>

          <div className="text-gray-400 pl-2">
            {isSending ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : message.trim() ? (
              <Send 
                className="h-6 w-6 cursor-pointer text-[#00A884] hover:text-[#02c499] transition-colors" 
                onClick={handleSendMessage}
              />
            ) : (
              <Mic 
                className={`h-6 w-6 cursor-pointer ${isRecording ? 'text-red-500' : 'hover:text-gray-200'} transition-colors`}
                onClick={toggleRecording}
              />
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ConversationView;
