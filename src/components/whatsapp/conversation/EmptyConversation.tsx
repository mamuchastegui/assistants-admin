
import React from "react";
import { MessageSquare, Loader2 } from "lucide-react";

interface EmptyConversationProps {
  isLoading?: boolean;
  selectedThread: string | null;
  assistantId: string | null;
  noMessages?: boolean;
}

const EmptyConversation: React.FC<EmptyConversationProps> = ({ 
  isLoading = false, 
  selectedThread,
  assistantId,
  noMessages = false
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando conversación...</p>
        </div>
      </div>
    );
  }
  
  if (!selectedThread || !assistantId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {!assistantId 
              ? "Por favor selecciona un asistente para ver las conversaciones" 
              : "Selecciona una conversación para ver los mensajes"
            }
          </p>
        </div>
      </div>
    );
  }
  
  if (noMessages) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No hay mensajes en esta conversación</p>
        </div>
      </div>
    );
  }
  
  return null;
};

export default EmptyConversation;
