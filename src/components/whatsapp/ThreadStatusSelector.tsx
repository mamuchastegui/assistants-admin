
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { THREAD_STATUSES } from "@/hooks/useChatThreads";
import { getStatusColor } from "./thread-list/StatusFilter";

interface ThreadStatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}

const STATUS_LABELS: { [key: string]: string } = {
  "new": "Nuevo",
  "bot_handling": "Bot atendiendo",
  "human_needed": "Requiere atención",
  "human_answering": "Respondiendo",
  "waiting_user": "Esperando usuario",
  "resolved": "Resuelto",
  "error": "Error",
  "archived": "Archivado",
  "expired": "Expirado"
};

const ThreadStatusSelector: React.FC<ThreadStatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  return (
    <div className="w-full">
      <Select
        value={currentStatus}
        onValueChange={onStatusChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className={`w-full text-xs h-8 px-3 font-medium ${getStatusColor(currentStatus)} text-white border-none`}
        >
          <SelectValue placeholder="Cambiar estado" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(THREAD_STATUSES).map((status) => (
            <SelectItem key={status} value={status} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
                {STATUS_LABELS[status] || status}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThreadStatusSelector;
