
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, RefreshCw, Database } from "lucide-react";
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
    <Card className="h-full shadow-md">
      <CardHeader className="space-y-1 pb-2 bg-gradient-to-r from-background to-muted/30 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Calendario</CardTitle>
          <Database className="h-4 w-4 text-primary/80" />
        </div>
        <CardDescription className="text-xs">
          Selecciona una fecha para ver o agregar turnos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full flex justify-center"
        >
          <div className="w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              locale={es}
              className="border rounded-md p-1 md:p-2 shadow-sm w-full max-w-full mx-auto bg-card/50"
            />
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3"
        >
          <Button 
            className="w-full text-xs sm:text-sm" 
            onClick={onSyncWithDatabase}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            Sincronizar con Supabase
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default CalendarSidebar;
