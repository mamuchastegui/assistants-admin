
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
      
      {/* Message area - Scrollable middle section with WhatsApp-style background */}
      <CardContent 
        className="flex-grow overflow-hidden p-4 bg-[#0B141A] rounded-md"
        style={{
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJRSURBVHgB7ZrNbtNAEMf/a7sNQnAicIK9gTgAJ/JWQeoNQxE3Tj1DpfaAvQG5AT1B2hsH2hwrLpUq9Qa8khEhVZGTZJP1fCRRG9vJxN6R9peMPbI12t/O7G7GAVYWgCNM4IZMHJIx5QCiEGJ9ipGouCUb3UQ3WSIeJk7oVGznz7bJjBAy1I5sE49nTs+4k8iEQjYn+httYCFHWTjQIkhkht5jLhsiQp0iX87UIE2FjEhSVU8jWQcOS4QYOVQBbSLhFBnBevI1QhmRSPZecgJRcSwHLYtUIqOey7e1MSJqFBnT2fvIAJEVI62SCd3/cYhsKI3IOBcRI5WCjqisM9a1LFKOrGPzzbtuVNftvX43/7xQdiT6/f46dmxcXnZp329vUKvdw6L4vlDu9fd3UNncAv3++PefmxW7OWc3bnZ20gcepc0bGsadfjdkjPZDiPYxZYjIoFRHGK5BxDD2Geu4XYeUoUmsBSQm0j3b8fxdShGZuEpCHcvQZHUhCfm+7W2Yi7OzX/7t3ldKEdnQIrE2kZBvZ4e6qqoJZYgo+FepfIw7LMvlfXVuN28GcEU3vF5vMm7HziLQPBJFIrmMujojXbW+AE22RinVuV+3wzt/SIgYhYOLJE4OWD8dU0KsTeQrUBeap8jSLyP2RXRLx9FFL0T1i98TY+7ouNK625hFvYwQ+fzuDvkrNQWfbJRoyB8nuL7e17yMENmAvkbvuxIixjZGxNgqYUUJK0pYUcI1nuu+aOw0I6KZGe7cZFhj5UOIFRERYxfnfwEmChD71zdxywAAAABJRU5ErkJggg==")`,
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
      
      {/* Footer area - Reserved for future chat input */}
      <CardFooter className="border-t p-3 flex-shrink-0 min-h-[50px] bg-[#1F2C34]">
        {/* This area is reserved for future chat input functionality */}
      </CardFooter>
    </Card>
  );
};

export default ConversationView;
