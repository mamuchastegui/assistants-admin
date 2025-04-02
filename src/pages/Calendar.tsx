
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AppointmentCalendar from "@/components/calendar/AppointmentCalendar";
import { Badge } from "@/components/ui/badge";

const Calendar = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Conectado a Airtable</Badge>
          </div>
          <p className="text-muted-foreground">
            Gestiona los turnos y la disponibilidad de tu negocio. Los cambios se sincronizan automáticamente con Airtable.
          </p>
        </div>
        
        <AppointmentCalendar />
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
