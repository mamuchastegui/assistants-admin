
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
import { Check, AlertCircle, User, Clock, CheckCircle2, XCircle, Archive, Timer } from "lucide-react";

interface ThreadStatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}

const STATUS_LABELS: { [key: string]: string } = {
  "new": "Nuevo",
  "human_needed": "Requiere atención",
  "human_answering": "Respondiendo",
  "waiting_user": "Esperando usuario",
  "resolved": "Resuelto",
  "error": "Error",
  "archived": "Archivado",
  "expired": "Expirado"
};

// Mapping estado -> icono
const STATUS_ICONS: { [key: string]: React.ComponentType } = {
  "new": AlertCircle,
  "human_needed": User,
  "human_answering": User,
  "waiting_user": Clock,
  "resolved": CheckCircle2,
  "error": XCircle,
  "archived": Archive,
  "expired": Timer,
};

const ThreadStatusSelector: React.FC<ThreadStatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  // Filter out bot_handling from the status options
  const displayableStatuses = Object.entries(THREAD_STATUSES)
    .filter(([_, value]) => value !== 'bot_handling')
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
  return (
    <div className="w-full">
      <Select
        value={currentStatus === 'bot_handling' ? 'waiting_user' : currentStatus}
        onValueChange={onStatusChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className={`w-full text-xs h-8 px-3 font-medium ${getStatusColor(currentStatus === 'bot_handling' ? 'waiting_user' : currentStatus)} text-white border-none`}
        >
          <SelectValue placeholder="Cambiar estado" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          {Object.values(displayableStatuses).map((status) => {
            const StatusIcon = STATUS_ICONS[status] || Check;
            
            return (
              <SelectItem key={status} value={status} className="flex items-center">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  {STATUS_LABELS[status] || status}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThreadStatusSelector;
