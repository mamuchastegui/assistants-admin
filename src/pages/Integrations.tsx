
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntegrationsPanel from "@/components/integrations/IntegrationsPanel";

const Integrations = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integraciones</h1>
          <p className="text-muted-foreground">
            Conecta tu asistente virtual con otras plataformas y servicios.
          </p>
        </div>
        
        <IntegrationsPanel />
      </div>
    </DashboardLayout>
  );
};

export default Integrations;
