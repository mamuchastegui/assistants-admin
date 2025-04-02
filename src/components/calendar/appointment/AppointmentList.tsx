
import React from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppointmentItem from "./AppointmentItem";

interface Appointment {
  id: string;
  time: string;
  client: string;
  service: string;
  duration: number;
  date: string;
  notes?: string;
  status?: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isLoading,
  onEdit,
  onDelete,
  onAddNew
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">No hay turnos para esta fecha</p>
        <Button 
          variant="outline" 
          onClick={onAddNew}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Turno
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {appointments.map((appointment) => (
        <AppointmentItem
          key={appointment.id}
          id={appointment.id}
          time={appointment.time}
          client={appointment.client}
          service={appointment.service}
          duration={appointment.duration}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AppointmentList;
