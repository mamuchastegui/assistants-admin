
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import RecentMessages from "@/components/dashboard/RecentMessages";
import AppointmentOverview from "@/components/dashboard/AppointmentOverview";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="px-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Bienvenido al panel de control de tu asistente virtual.
          </p>
        </div>
        
        <DashboardSummary />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <AppointmentOverview />
          <RecentMessages />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
