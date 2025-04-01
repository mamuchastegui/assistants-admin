
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, ClipboardCheck, ChevronRight } from "lucide-react";

interface Appointment {
  id: number;
  client: string;
  time: string;
  service: string;
  confirmed: boolean;
}

const appointments: Appointment[] = [
  {
    id: 1,
    client: "Ana García",
    time: "10:00",
    service: "Corte de pelo",
    confirmed: true
  },
  {
    id: 2,
    client: "Carlos López",
    time: "11:30",
    service: "Afeitado",
    confirmed: true
  },
  {
    id: 3,
    client: "Sofía Rodríguez",
    time: "14:00",
    service: "Tinte",
    confirmed: false
  },
  {
    id: 4,
    client: "Luis Martínez",
    time: "16:30",
    service: "Manicura",
    confirmed: false
  }
];

const AppointmentOverview: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Próximos Turnos</CardTitle>
          <CardDescription>
            Turnos para hoy
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          <span>Ver Calendario</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 w-10 h-10 rounded-md flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{appointment.client}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{appointment.time}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{appointment.service}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {appointment.confirmed ? (
                  <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
                ) : (
                  <Button variant="outline" size="sm" className="gap-1">
                    <ClipboardCheck className="h-3 w-3" />
                    <span>Confirmar</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentOverview;
