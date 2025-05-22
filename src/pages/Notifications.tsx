
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { Notebook, Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl">
        <PageHeader
          title="Notificaciones"
          description="Centro de notificaciones y alertas"
          icon={<Bell className="h-5 w-5" />}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <NotificationPanel />
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Notebook className="h-5 w-5" />
              Acerca de las notificaciones
            </h2>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                El sistema muestra alertas en tiempo real cuando hay solicitudes que requieren atención humana.
              </p>
              <p>
                Se reproducirá un sonido de notificación cuando lleguen nuevas solicitudes, y el contador se actualizará automáticamente.
              </p>
              <p>
                Las notificaciones se actualizan automáticamente y mantienen la conexión en segundo plano.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
