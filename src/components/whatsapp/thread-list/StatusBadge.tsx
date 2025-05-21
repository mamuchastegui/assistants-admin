
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from './StatusFilter';

interface StatusBadgeProps {
  status: string;
}

const STATUS_LABELS: { [key: string]: string } = {
  "human_needed": "Requiere atención",
  "human_answering": "Respondiendo",
  "error": "Error",
  "waiting_user": "Esperando usuario",
  "new": "Nuevo",
  "resolved": "Resuelto",
  "archived": "Archivado",
  "expired": "Expirado"
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Do not render anything for bot_handling status
  if (status === 'bot_handling') {
    return null;
  }
  
  const statusLabel = STATUS_LABELS[status] || status;
  const colorClass = getStatusColor(status);
  
  return (
    <Badge 
      className={`${colorClass} text-white text-[0.65rem] py-0 px-1 h-4`}
      variant="outline"
    >
      {statusLabel}
    </Badge>
  );
};

export default StatusBadge;
