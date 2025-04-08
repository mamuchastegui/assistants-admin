
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AssistantConfig from "@/components/assistant/AssistantConfig";

const Assistant = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 h-full pb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Chat de WhatsApp</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza todas las conversaciones de WhatsApp con tus clientes.
          </p>
        </div>
        
        <AssistantConfig />
      </div>
    </DashboardLayout>
  );
};

export default Assistant;
