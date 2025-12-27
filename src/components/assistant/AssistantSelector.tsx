
import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssistants } from "@/hooks/useAssistants";
import { Loader2, Bot, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AssistantSelectorProps {
  onAssistantChange?: (assistantId: string) => void;
}

const AssistantSelector: React.FC<AssistantSelectorProps> = ({
  onAssistantChange
}) => {
  const {
    assistants,
    selectedAssistantId,
    selectAssistant,
    loading,
    error,
    isEmpty
  } = useAssistants();

  useEffect(() => {
    if (selectedAssistantId && onAssistantChange) {
      onAssistantChange(selectedAssistantId);
    }
  }, [selectedAssistantId, onAssistantChange]);

  if (loading) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Cargando asistentes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        Error al cargar asistentes
      </div>
    );
  }

  if (isEmpty) {
    return (
      <Card className="p-4 border-dashed">
        <div className="flex items-start gap-3">
          <Bot className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Sin asistentes configurados</p>
            <p className="text-xs text-muted-foreground">
              Contacta al administrador para configurar un asistente de IA para tu cuenta.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // If there's only one assistant, just show its name without dropdown
  if (assistants.length === 1 && selectedAssistantId) {
    const assistant = assistants.find(a => a.assistant_id === selectedAssistantId);
    return (
      <div className="text-sm font-medium">
        Asistente: {assistant?.name || selectedAssistantId}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm text-muted-foreground">Seleccionar asistente</label>
      <Select
        value={selectedAssistantId || ""}
        onValueChange={(value) => {
          selectAssistant(value);
        }}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Seleccionar un asistente" />
        </SelectTrigger>
        <SelectContent>
          {assistants.map((assistant) => (
            <SelectItem
              key={assistant.assistant_id}
              value={assistant.assistant_id}
            >
              {assistant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssistantSelector;
