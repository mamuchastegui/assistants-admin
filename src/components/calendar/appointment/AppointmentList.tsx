
import React from "react";
import { Plus, Loader2, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppointmentItem from "./AppointmentItem";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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
  // Sort appointments by date and time
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

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

  // Group appointments by date
  const appointmentsByDate = sortedAppointments.reduce((acc, appointment) => {
    const date = appointment.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <AnimatePresence>
      <div className="space-y-6 p-1">
        {Object.entries(appointmentsByDate).map(([date, dateAppointments]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm p-2 rounded-lg border border-border/40 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">
                {format(new Date(date), "EEEE, d 'de' MMMM")}
              </h3>
            </div>
            
            {dateAppointments.map((appointment, index) => (
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
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};

export default AppointmentList;
