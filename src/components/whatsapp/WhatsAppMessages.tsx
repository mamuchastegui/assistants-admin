import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, MessageSquare, Search, Image } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Eliminar importación de useWhatsAppMessages y tipo WhatsAppMessage
// En lugar de usar el hook mockeado, usaremos los datos directamente de la API

// Definir interfaz para WhatsAppMessage sin dependencia de hook
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

const WhatsAppMessages: React.FC = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Como ya no usamos el hook mockeado, esta parte será 100% dinámica en el futuro
  // Por ahora dejamos un componente que muestra un estado de carga
  // Esto se conectará a la API real posteriormente

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

        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground mb-2">
            Conectando con la API de mensajes...
          </p>
          <p className="text-sm text-muted-foreground">
            Esta función estará disponible próximamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Eliminamos el componente MessageItem ya que no lo estamos usando por ahora
// Lo implementaremos cuando tengamos datos reales de la API

export default WhatsAppMessages;
