import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWhatsAppMessages, WhatsAppMessage } from "@/hooks/useWhatsAppMessages";
import { Loader2, RefreshCw, MessageSquare, Search, Image } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const WhatsAppMessages: React.FC = () => {
  const { messages, loading, error, hasMore, loadMore, refreshMessages } = useWhatsAppMessages();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMessages = messages.filter(
    (message) => 
      message.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.phoneNumber.includes(searchTerm) ||
      (message.profileName && message.profileName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          onClick={refreshMessages}
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

        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>Error al cargar los mensajes. Intenta nuevamente.</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground mb-2">No hay mensajes disponibles</p>
            {searchTerm && (
              <p className="text-sm text-muted-foreground">
                No se encontraron resultados para "{searchTerm}"
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <MessageItem key={message._id} message={message} />
            ))}
            
            {hasMore && (
              <div className="text-center pt-2">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Cargar más mensajes"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MessageItemProps {
  message: WhatsAppMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isInbound = message.direction === "inbound";
  const timestamp = new Date(message.timestamp);
  
  const formatPhoneNumber = (phoneNumber: string): string => {
    // Eliminar el prefijo "whatsapp:" si existe
    return phoneNumber.replace("whatsapp:", "");
  };
  
  const getInitials = (name?: string): string => {
    if (!name) return "WA";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };
  
  const getStatusBadge = () => {
    switch (message.status) {
      case "received":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Recibido</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Enviado</Badge>;
      case "delivered":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Entregado</Badge>;
      case "read":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Leído</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Fallido</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarFallback className={isInbound ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}>
          {getInitials(message.profileName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold">
              {message.profileName || formatPhoneNumber(message.phoneNumber)}
            </h4>
            {getStatusBadge()}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(timestamp, { addSuffix: true, locale: es })}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground">{message.body}</p>
        
        {message.media && message.media.length > 0 && (
          <div className="flex items-center text-xs text-primary mt-1">
            <Image className="h-3 w-3 mr-1" />
            <span>{message.media.length} {message.media.length === 1 ? "archivo adjunto" : "archivos adjuntos"}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppMessages;
