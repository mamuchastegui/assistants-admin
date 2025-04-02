
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, RefreshCw, Database } from "lucide-react";
import { es } from "date-fns/locale";

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
    <Card className="md:col-span-1">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>Calendario</CardTitle>
          <Database className="h-4 w-4 text-blue-500" />
        </div>
        <CardDescription>
          Selecciona una fecha para ver o agregar turnos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          locale={es}
          className={`pointer-events-auto border rounded-md p-3`}
        />
        <div className="mt-4">
          <Button 
            className="w-full" 
            onClick={onSyncWithDatabase}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sincronizar con Supabase
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarSidebar;
