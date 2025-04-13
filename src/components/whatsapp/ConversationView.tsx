
import React from "react";
import { Conversation } from "@/hooks/useChatThreads";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);
  
  // Helper function to safely get initials from a name
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
      {/* Header - Fixed at top */}
      <CardHeader className="pb-2 border-b flex-shrink-0">
        <CardTitle className="text-lg flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>
              {getInitials(conversation.profile_name)}
            </AvatarFallback>
          </Avatar>
          {displayName}
        </CardTitle>
      </CardHeader>
      
      {/* Message area - Scrollable middle section with chat background */}
      <CardContent className="flex-grow overflow-hidden p-4 bg-[#1A1F2C] bg-opacity-95 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cGF0aCBkPSJNNDAgNDAuNUw0MC41IDQwTDQwIDM5LjVMMzkuNSA0MEw0MCA0MC41Wk02MCA2MC41TDYwLjUgNjBMNjAgNTkuNUw1OS41IDYwTDYwIDYwLjVaTTgwIDgwLjVMODAuNSA4MEw4MCA3OS41TDc5LjUgODBMODAgODAuNVpNMTAwIDEwMC41TDEwMC41IDEwMEwxMDAgOTkuNUw5OS41IDEwMEwxMDAgMTAwLjVaTTEyMCAxMjAuNUwxMjAuNSAxMjBMMTIwIDExOS41TDExOS41IDEyMEwxMjAgMTIwLjVaTTE0MCAxNDAuNUwxNDAuNSAxNDBMMTQwIDEzOS41TDEzOS41IDE0MEwxNDAgMTQwLjVaTTE2MCAxNjAuNUwxNjAuNSAxNjBMMTYwIDE1OS41TDE1OS41IDE2MEwxNjAgMTYwLjVaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')] rounded-md">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {conversation.conversation.map((message, index) => {
              const date = new Date(message.timestamp);
              const isUser = message.role === "user";

              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 shadow-md ${
                      isUser
                        ? "bg-[#6E59A5] text-white" // Purple for user messages
                        : "bg-[#333333] text-gray-100" // Dark gray for assistant messages
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        isUser ? "text-gray-200" : "text-gray-400"
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
      
      {/* Footer area - Reserved for future chat input */}
      <CardFooter className="border-t p-3 flex-shrink-0 min-h-[50px] bg-[#222222]">
        {/* This area is reserved for future chat input functionality */}
      </CardFooter>
    </Card>
  );
};

export default ConversationView;
