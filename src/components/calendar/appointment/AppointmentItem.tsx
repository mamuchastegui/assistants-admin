
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface AppointmentProps {
  id: string;
  time: string;
  client: string;
  service: string;
  duration: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const AppointmentItem: React.FC<AppointmentProps> = ({ 
  id, time, client, service, duration, onEdit, onDelete 
}) => {
  return (
    <div className="p-3 mb-2 bg-white rounded-md border border-gray-200 hover:border-primary transition-colors">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{time}</span>
          <span className="text-xs text-gray-500">{duration} min</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(id)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(id)}>
            Eliminar
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="font-medium">{client}</p>
        <p className="text-sm text-gray-600">{service}</p>
      </div>
    </div>
  );
};

export default AppointmentItem;
