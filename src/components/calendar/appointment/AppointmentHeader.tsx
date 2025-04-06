
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react";
import { motion } from "framer-motion";

interface AppointmentHeaderProps {
  selectedDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onResetForm: () => void;
  onOpenNewDialog: () => void;
}

const AppointmentHeader: React.FC<AppointmentHeaderProps> = ({
  selectedDate,
  onPrevDay,
  onNextDay,
  onResetForm,
  onOpenNewDialog,
}) => {
  const currentDate = new Date();
  // Check if selected date is today
  const isToday =
    selectedDate.getDate() === currentDate.getDate() &&
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getFullYear() === currentDate.getFullYear();

  const handleNewAppointment = () => {
    onResetForm();
    onOpenNewDialog();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevDay}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-base md:text-lg font-medium">
              {format(selectedDate, "EEEE dd 'de' MMMM", { locale: es })}
              {isToday && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground py-0.5 px-1.5 rounded-full">
                  Hoy
                </span>
              )}
            </h3>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextDay}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gestiona los turnos para esta fecha
        </p>
      </div>
      <Button size="sm" className="shrink-0" onClick={handleNewAppointment}>
        <CalendarPlus className="mr-2 h-3.5 w-3.5" />
        Nuevo Turno
      </Button>
    </div>
  );
};

export default AppointmentHeader;
