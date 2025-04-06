
import React from "react";
import { Plus, Loader2, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppointmentItem from "./AppointmentItem";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="flex justify-center items-center h-40 bg-muted/5 rounded-lg border border-border/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-10 bg-muted/5 rounded-lg border border-dashed border-border/50"
      >
        <CalendarPlus className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4 text-sm">No hay turnos programados para esta fecha</p>
        <Button 
          onClick={onAddNew}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Turno
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <div className="space-y-3 p-1">
        {appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <AppointmentItem
              id={appointment.id}
              time={appointment.time}
              client={appointment.client}
              service={appointment.service}
              duration={appointment.duration}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};

export default AppointmentList;
