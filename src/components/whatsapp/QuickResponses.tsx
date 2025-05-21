
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface QuickResponsesProps {
  onSelectResponse: (response: string) => void;
  profileName?: string | null;
  currentUserName?: string | null;
}

const QuickResponses: React.FC<QuickResponsesProps> = ({ 
  onSelectResponse,
  profileName = "Cliente", 
  currentUserName = "Asistente"
}) => {
  // Predefined quick response templates
  const responseTemplates = [
    `Hola ${profileName}, mi nombre es ${currentUserName}, ¿en qué puedo ayudarte hoy?`,
    "Podés abonar con transferencia bancaria o tarjetas de crédito (10% de recargo). Hacemos envíos a todo el país 🇦🇷",
    "¡Gracias por tu compra! Tu paquete será enviado en las próximas 24-48 horas.",
    "¿Necesitas alguna información adicional sobre nuestros productos?",
    "Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00.",
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full hover:bg-primary/10"
          title="Respuestas rápidas"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="start" 
        className="p-2 w-96 max-h-[300px] overflow-y-auto"
        sideOffset={10}
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-center pb-2">Respuestas rápidas</p>
          <div className="grid gap-2">
            {responseTemplates.map((template, index) => (
              <HoverCard key={index} openDelay={300}>
                <HoverCardTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-2 px-3 text-left whitespace-normal"
                    onClick={() => onSelectResponse(template)}
                  >
                    <span className="line-clamp-1">{template}</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-2">
                  <p className="text-sm break-words">{template}</p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default QuickResponses;
