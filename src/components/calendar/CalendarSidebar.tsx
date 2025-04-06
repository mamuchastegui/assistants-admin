
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
    <Card className="lg:col-span-1 h-full">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Calendario</CardTitle>
          <Database className="h-4 w-4 text-primary" />
        </div>
        <CardDescription className="text-xs md:text-sm">
          Selecciona una fecha para ver o agregar turnos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative w-full flex justify-center">
          <div className="w-full overflow-x-auto pb-2 -mx-2 px-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              locale={es}
              className="border rounded-md p-1 md:p-3 w-full max-w-full md:max-w-[300px] mx-auto"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button 
            className="w-full text-sm" 
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
