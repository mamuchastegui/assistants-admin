
import React from "react";
import { useChatThreads } from "@/hooks/useChatThreads";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ConversationView: React.FC = () => {
  const { conversation, loadingConversation, selectedThread } = useChatThreads();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  if (!selectedThread) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Selecciona una conversación para ver los mensajes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadingConversation) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando conversación...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!conversation) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No se pudo cargar la conversación</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>
              {conversation.profile_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {conversation.profile_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[550px] pr-4">
          <div className="space-y-4">
            {conversation.conversation.map((message, index) => {
              const date = new Date(message.timestamp);
              const isUser = message.role === "user";

              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        isUser ? "text-primary-foreground/80" : "text-muted-foreground"
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
    </Card>
  );
};

export default ConversationView;
