
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AppointmentCalendar from "@/components/calendar/AppointmentCalendar";

const Calendar = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Gestiona los turnos y la disponibilidad de tu negocio.
          </p>
        </div>
        
        <AppointmentCalendar />
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
