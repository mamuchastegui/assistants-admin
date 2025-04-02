
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
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Conectado a Supabase</Badge>
          </div>
          <p className="text-muted-foreground">
            Gestiona los turnos y la disponibilidad de tu negocio. Los datos se almacenan en la base de datos Supabase.
          </p>
        </div>
        
        <AppointmentCalendar />
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
