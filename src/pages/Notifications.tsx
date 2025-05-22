
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import NotificationPanel from '@/components/notifications/NotificationPanel';

const Notifications = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl">
        <PageHeader
          title="Notificaciones"
          description="Centro de notificaciones y alertas"
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <NotificationPanel />
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Acerca de las notificaciones</h2>
            <p className="text-sm text-muted-foreground mb-3">
              El sistema muestra alertas en tiempo real cuando hay solicitudes que requieren atención humana.
            </p>
            <p className="text-sm text-muted-foreground">
              Se reproducirá un sonido de notificación cuando lleguen nuevas solicitudes, y el contador se actualizará automáticamente.
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
