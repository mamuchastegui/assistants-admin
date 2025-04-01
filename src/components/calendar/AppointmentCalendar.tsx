
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Plus, RefreshCw } from "lucide-react";

// Esta simulación sería reemplazada por la integración con Airtable
const fakeAppointments = [
  { id: 1, time: "09:00", client: "Ana García", service: "Corte de pelo", duration: 30 },
  { id: 2, time: "10:30", client: "Luis Martínez", service: "Tinte", duration: 60 },
  { id: 3, time: "13:00", client: "Sofía Rodríguez", service: "Manicura", duration: 45 },
  { id: 4, time: "15:30", client: "Carlos López", service: "Afeitado", duration: 30 },
];

interface AppointmentProps {
  id: number;
  time: string;
  client: string;
  service: string;
  duration: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const Appointment: React.FC<AppointmentProps> = ({ 
  id, time, client, service, duration, onEdit, onDelete 
}) => {
  return (
    <div className="p-3 mb-2 bg-white rounded-md border border-gray-200 hover:border-primary transition-colors">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{time}</span>
          <span className="text-xs text-gray-500">{duration} min</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(id)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(id)}>
            Eliminar
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="font-medium">{client}</p>
        <p className="text-sm text-gray-600">{service}</p>
      </div>
    </div>
  );
};

const AppointmentCalendar: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState(fakeAppointments);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isEditAppointmentOpen, setIsEditAppointmentOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<number | null>(null);
  
  // En un caso real, esto se conectaría a Airtable para sincronizar los turnos
  const syncWithAirtable = () => {
    console.log("Sincronizando con Airtable...");
    // Simulación de actualización exitosa
    setTimeout(() => {
      console.log("Sincronización completada");
    }, 1000);
  };

  const handleEdit = (id: number) => {
    setCurrentAppointment(id);
    setIsEditAppointmentOpen(true);
  };

  const handleDelete = (id: number) => {
    setAppointments(appointments.filter(appointment => appointment.id !== id));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader className="pb-0">
          <CardTitle>Calendario</CardTitle>
          <CardDescription>
            Selecciona una fecha para ver o agregar turnos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={es}
            className={`pointer-events-auto border rounded-md p-3`}
          />
          <div className="mt-4">
            <Button className="w-full" onClick={syncWithAirtable}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar con Airtable
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Turnos</CardTitle>
            <CardDescription>
              {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Turno
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nuevo Turno</DialogTitle>
                  <DialogDescription>
                    Completa los detalles para crear un nuevo turno
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Fecha
                    </Label>
                    <Input
                      id="date"
                      value={format(selectedDate, "dd/MM/yyyy")}
                      className="col-span-3"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Hora
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      defaultValue="09:00"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="client" className="text-right">
                      Cliente
                    </Label>
                    <Input
                      id="client"
                      placeholder="Nombre del cliente"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="service" className="text-right">
                      Servicio
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="haircut">Corte de pelo</SelectItem>
                        <SelectItem value="coloring">Tinte</SelectItem>
                        <SelectItem value="manicure">Manicura</SelectItem>
                        <SelectItem value="shaving">Afeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duración
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar duración" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1 hora 30 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsNewAppointmentOpen(false)}>
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <Appointment
                  key={appointment.id}
                  id={appointment.id}
                  time={appointment.time}
                  client={appointment.client}
                  service={appointment.service}
                  duration={appointment.duration}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No hay turnos para esta fecha</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewAppointmentOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Turno
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditAppointmentOpen} onOpenChange={setIsEditAppointmentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Turno</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del turno
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Appointment edit form with filled values */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Fecha
              </Label>
              <Input
                id="edit-date"
                value={format(selectedDate, "dd/MM/yyyy")}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-time" className="text-right">
                Hora
              </Label>
              <Input
                id="edit-time"
                type="time"
                defaultValue={currentAppointment ? 
                  appointments.find(a => a.id === currentAppointment)?.time : "09:00"}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client" className="text-right">
                Cliente
              </Label>
              <Input
                id="edit-client"
                defaultValue={currentAppointment ? 
                  appointments.find(a => a.id === currentAppointment)?.client : ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-service" className="text-right">
                Servicio
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={currentAppointment ? 
                    appointments.find(a => a.id === currentAppointment)?.service : "Seleccionar servicio"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="haircut">Corte de pelo</SelectItem>
                  <SelectItem value="coloring">Tinte</SelectItem>
                  <SelectItem value="manicure">Manicura</SelectItem>
                  <SelectItem value="shaving">Afeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-duration" className="text-right">
                Duración
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={currentAppointment ? 
                    `${appointments.find(a => a.id === currentAppointment)?.duration} minutos` : "Seleccionar duración"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1 hora 30 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsEditAppointmentOpen(false)}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;
