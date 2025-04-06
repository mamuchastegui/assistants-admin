
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RefreshCw, MessageSquare, Search, Image } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

// Define interface for WhatsAppMessage
interface WhatsAppMessage {
  _id: string;
  phoneNumber: string;
  profileName?: string;
  body: string;
  direction: "inbound" | "outbound";
  status: "received" | "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  media?: { url: string; contentType: string; }[];
}

// Define interface for WhatsApp API response
interface ThreadResponse {
  thread_id: string;
  user_id: string;
  profile_name: string;
  assistant_id: string;
  conversation: {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }[];
  created_at: string;
  updated_at: string;
}

const ASSISTANT_ID = "asst_OS4bPZIMBpvpYo2GMkG0ast5";

const WhatsAppMessages: React.FC = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadData, setThreadData] = useState<ThreadResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingThread, setLoadingThread] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.condamind.com/chat/threads", {
        headers: {
          "assistant-id": ASSISTANT_ID
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setThreads(data);
      setLoading(false);
      
      // Select first thread if available
      if (data.length > 0) {
        selectThread(data[0].thread_id);
      }
    } catch (err) {
      console.error("Error fetching chat threads:", err);
      setError(err.message);
      setLoading(false);
      toast.error("No se pudieron cargar las conversaciones");
    }
  };

  const selectThread = async (threadId: string) => {
    try {
      setSelectedThread(threadId);
      setLoadingThread(true);
      
      const response = await fetch(`https://api.condamind.com/chat/threads/${threadId}`, {
        headers: {
          "assistant-id": ASSISTANT_ID
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log("Thread data:", data);
      setThreadData(data);
      setLoadingThread(false);
    } catch (err) {
      console.error("Error fetching thread:", err);
      setLoadingThread(false);
      toast.error("No se pudo cargar la conversación");
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return "WA";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };
  
  const formatPhoneNumber = (phoneNumber: string): string => {
    // Eliminar el prefijo "whatsapp:" si existe
    let formatted = phoneNumber.replace("whatsapp:", "");
    // Formatear como +XX XXX XXX XXX
    return formatted;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Mensajes de WhatsApp</CardTitle>
          <CardDescription>
            Conversaciones recientes con tus clientes
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchThreads}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mensajes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">
              Cargando conversaciones...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground mb-2">
              Error al cargar las conversaciones
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {error}
            </p>
            <Button variant="outline" onClick={fetchThreads}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground mb-2">
              No hay conversaciones disponibles
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {!selectedThread ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground mb-2">
                  Selecciona una conversación para ver los mensajes
                </p>
              </div>
            ) : loadingThread ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">
                  Cargando conversación...
                </p>
              </div>
            ) : !threadData ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground mb-2">
                  No se pudo cargar la conversación
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>
                      {getInitials(threadData.profile_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-medium">{threadData.profile_name || "Usuario"}</h3>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(threadData.updated_at), "d MMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
                
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {threadData.conversation
                      .filter(msg => 
                        !searchTerm || 
                        msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((message, index) => {
                        const isUser = message.role === "user";
                        const date = new Date(message.timestamp);
                        
                        return (
                          <MessageItem
                            key={index}
                            message={{
                              _id: `${index}`,
                              phoneNumber: threadData.user_id,
                              profileName: isUser ? threadData.profile_name : "Asistente",
                              body: message.content,
                              direction: isUser ? "inbound" : "outbound",
                              status: "received",
                              timestamp: message.timestamp,
                            }}
                          />
                        );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MessageItem: React.FC<{ message: WhatsAppMessage }> = ({ message }) => {
  const isInbound = message.direction === "inbound";
  const date = new Date(message.timestamp);
  
  return (
    <div className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isInbound
            ? "bg-muted"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {!isInbound && (
          <div className="mb-1 text-xs text-primary-foreground/80 font-medium">
            {message.profileName || "Asistente"}
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.body}</div>
        <div
          className={`text-xs mt-1 ${
            isInbound ? "text-muted-foreground" : "text-primary-foreground/80"
          }`}
        >
          {format(date, "HH:mm", { locale: es })}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMessages;

