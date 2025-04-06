
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, RefreshCw, CalendarDays } from "lucide-react";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

interface CalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  onSyncWithDatabase: () => void;
  isLoading: boolean;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate,
  onDateSelect,
  onSyncWithDatabase,
  isLoading
}) => {
  return (
    <Card className="h-full shadow-md overflow-hidden">
      <CardHeader className="space-y-1 pb-2 bg-gradient-to-r from-background to-muted/30 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Calendario
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Selecciona una fecha para ver o agregar turnos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-4 px-3">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-center"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            locale={es}
            className="rounded-md p-0 md:p-1 shadow-sm w-full max-w-full bg-card/50 pointer-events-auto"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <Button 
            className="w-full text-xs sm:text-sm" 
            onClick={onSyncWithDatabase}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            Sincronizar con Base de Datos
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default CalendarSidebar;
