
import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssistants } from "@/hooks/useAssistants";
import { Loader2 } from "lucide-react";

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
    error 
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
      <div className="text-sm text-red-500">
        Error al cargar asistentes
      </div>
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
              {assistant.name || assistant.assistant_id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssistantSelector;
