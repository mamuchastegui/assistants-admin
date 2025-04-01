
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

interface Message {
  id: number;
  client: {
    name: string;
    image?: string;
  };
  preview: string;
  timestamp: string;
  status: "appointment_booked" | "question" | "pending" | "resolved";
}

const getStatusBadge = (status: Message["status"]) => {
  switch (status) {
    case "appointment_booked":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Turno Agendado</Badge>;
    case "question":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Consulta</Badge>;
    case "pending":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pendiente</Badge>;
    case "resolved":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Resuelto</Badge>;
  }
};

const messages: Message[] = [
  {
    id: 1,
    client: {
      name: "Ana García",
    },
    preview: "Hola, me gustaría saber si tienen disponibilidad para un corte de pelo mañana",
    timestamp: "Hace 25 minutos",
    status: "appointment_booked"
  },
  {
    id: 2,
    client: {
      name: "Carlos López",
    },
    preview: "¿Cuál es el precio de un tinte completo?",
    timestamp: "Hace 1 hora",
    status: "question"
  },
  {
    id: 3,
    client: {
      name: "María Rodríguez",
    },
    preview: "Quisiera cambiar mi cita del viernes para el sábado, ¿es posible?",
    timestamp: "Hace 3 horas",
    status: "pending"
  },
  {
    id: 4,
    client: {
      name: "Luis Torres",
    },
    preview: "Muchas gracias por el servicio de hoy, ¡quedé muy contento con el resultado!",
    timestamp: "Ayer",
    status: "resolved"
  },
];

const RecentMessages: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mensajes Recientes</CardTitle>
        <CardDescription>
          Las últimas interacciones con tus clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={message.client.image} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {message.client.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{message.client.name}</h4>
                    {getStatusBadge(message.status)}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{message.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{message.preview}</p>
                {message.status === "appointment_booked" && (
                  <div className="flex items-center text-xs text-primary">
                    <CalendarClock className="h-3 w-3 mr-1" />
                    <span>Turno: Mañana, 14:30</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentMessages;
