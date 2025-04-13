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
        <CardTitle className="text-lg flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>
              {getInitials(conversation.profile_name)}
            </AvatarFallback>
          </Avatar>
          {displayName}
        </CardTitle>
      </CardHeader>
      
      <CardContent 
        className="flex-grow overflow-hidden p-4 bg-[#0B141A] rounded-md"
        style={{
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKsSURBVHgB7ZrLjtNAFIbPdTtpZyBEkSCWLHgEHoHHgQXLrJAYtoRHgAchXsCCBQsWdGSBhRASQgjpnekZT9VxvNPYyZ2kp9WyXPvUqVPn5GRZFv4dZ+EymcwTcRwP6vX6y0ajYZxfUOu6fvLw8PAuvb6u60vm9QGwLAMoGBM3TXMALqHsNdAxgFqtVj2bz2+32x3luq5g1Gq1i9lsFjRNUyBJEgHDMORarfYMN4zD4XA4f3h4uDkcDn/gplKpvMXN6enpTaVSeYObVqt1jZtOp/Ma/ya5ueu6N8PhMHie9xI3p6en17hpt9vXuOl2u9e46ff7uD8+Pj75/Pn0BzfD4fAaN71e7xo3/X7/GjdxHH/izlp1lmVfRqPRN9wMh0Pcx3H8BTc/7kPcOxaLxRvchGH4KxqN/sRN2ALHcV5xE4Zhfyiv32g0XuKm2WxCzPurGeDvF6PR6AJH7vb29l5xk6bpF9z0+/3nuEl+7vb29jNuHo1G+KvPwPM8vGFZVjMajSJd193CzYRhmPh3EAbq8/n8NW5CoRDudLvdj7jBX/CcOiTWIWsNmDWJ/z0ajb7hJhQK4Y7tIOqvuPEcx/kWj8cfcRMIBHCn2+1+xs3Lly/x/5evX3Fz7+3t3bvdbjIajSLTNN3CTaVSgbu3t7dv3Nzf38PtdrsbNy9fvsT/L1++5Om+b7cNw2hxI4/jOHYcZ5Df6/r6+gu3LMsqZCdrDCxr7blOp/MVN6FQCHdarRZasVeBN+SvRlB/LhQK33BTKBRwp9vt4p733G63i3q9/hI3uVwOd7rdLt4fxfFrvMFisVi0Wi2n1WrFuPEcB3csy4Lb0Wi0lMvlvuJOQgjhD7/JhmHA3+PxeNi27clisViuVCrXiPNH6D8bQsi4lsMwXEomk690Ov2BTCaz1Ol0rNA///6G0P9R+L/gHzPSumT8q7NyAAAAAElFTkSuQmCC")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '64px'
        }}
      >
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
                        ? "bg-[#005C4B] text-white" // Green for user messages (classic WhatsApp)
                        : "bg-[#1F2C34] text-gray-100" // Dark gray for assistant messages
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
      
      <CardFooter className="border-t p-3 flex-shrink-0 min-h-[50px] bg-[#1F2C34]">
        {/* This area is reserved for future chat input functionality */}
      </CardFooter>
    </Card>
  );
};

export default ConversationView;
