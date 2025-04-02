import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Plus, RefreshCw, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  mapAirtableToAppointment,
  mapAppointmentToAirtable
} from "@/services/airtableService";

interface Appointment {
  id: string;
  time: string;
  client: string;
  service: string;
  duration: number;
  date: string;
  notes?: string;
  status?: string;
}

interface AppointmentFormData {
  client: string;
  service: string;
  time: string;
  duration: string;
  notes?: string;
}

interface AppointmentProps {
  id: string;
  time: string;
  client: string;
  service: string;
  duration: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isEditAppointmentOpen, setIsEditAppointmentOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<string | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>({
    client: "",
    service: "",
    time: "09:00",
    duration: "30",
    notes: "",
  });
  
  const queryClient = useQueryClient();
  
  const { data: airtableAppointments, isLoading, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });
  
  const createMutation = useMutation({
    mutationFn: (data: ReturnType<typeof mapAppointmentToAirtable>) => {
      return createAppointment(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsNewAppointmentOpen(false);
      resetForm();
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReturnType<typeof mapAppointmentToAirtable>> }) => {
      return updateAppointment(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsEditAppointmentOpen(false);
      resetForm();
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return deleteAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const filteredAppointments: Appointment[] = React.useMemo(() => {
    if (!airtableAppointments) return [];
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
    return airtableAppointments
      .filter(app => app.fields.date === formattedDate)
      .map(mapAirtableToAppointment)
      .sort((a, b) => {
        return a.time.localeCompare(b.time);
      });
  }, [airtableAppointments, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      setSelectedDate(date);
    }
  };

  const resetForm = () => {
    setFormData({
      client: "",
      service: "",
      time: "09:00",
      duration: "30",
      notes: "",
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('edit-', '')]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (id: string) => {
    const appointment = filteredAppointments.find(app => app.id === id);
    if (appointment) {
      setFormData({
        client: appointment.client,
        service: appointment.service,
        time: appointment.time,
        duration: appointment.duration.toString(),
        notes: appointment.notes || "",
      });
      setCurrentAppointment(id);
      setIsEditAppointmentOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este turno?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaveNew = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const appointmentData = mapAppointmentToAirtable({
      client: formData.client,
      service: formData.service,
      date: dateStr,
      time: formData.time,
      duration: parseInt(formData.duration),
      notes: formData.notes,
      status: "confirmed"
    });
    
    createMutation.mutate(appointmentData);
  };

  const handleSaveEdit = () => {
    if (!currentAppointment) return;
    
    const appointmentData = mapAppointmentToAirtable({
      client: formData.client,
      service: formData.service,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: formData.time,
      duration: parseInt(formData.duration),
      notes: formData.notes,
      status: "confirmed"
    });
    
    updateMutation.mutate({ 
      id: currentAppointment, 
      data: appointmentData 
    });
  };

  const syncWithAirtable = () => {
    refetch();
    toast.success("Sincronizando con Airtable...");
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
            <Button 
              className="w-full" 
              onClick={syncWithAirtable}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
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
                <Button size="sm" onClick={resetForm}>
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
                      value={formData.time}
                      onChange={handleFormChange}
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
                      value={formData.client}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="service" className="text-right">
                      Servicio
                    </Label>
                    <Select 
                      value={formData.service} 
                      onValueChange={(value) => handleSelectChange(value, 'service')}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Corte de pelo">Corte de pelo</SelectItem>
                        <SelectItem value="Tinte">Tinte</SelectItem>
                        <SelectItem value="Manicura">Manicura</SelectItem>
                        <SelectItem value="Afeitado">Afeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duración
                    </Label>
                    <Select 
                      value={formData.duration} 
                      onValueChange={(value) => handleSelectChange(value, 'duration')}
                    >
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notas
                    </Label>
                    <Input
                      id="notes"
                      placeholder="Notas adicionales"
                      value={formData.notes}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleSaveNew}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditAppointmentOpen} onOpenChange={setIsEditAppointmentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Turno</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del turno
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                value={formData.time}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client" className="text-right">
                Cliente
              </Label>
              <Input
                id="edit-client"
                value={formData.client}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-service" className="text-right">
                Servicio
              </Label>
              <Select 
                value={formData.service} 
                onValueChange={(value) => handleSelectChange(value, 'service')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corte de pelo">Corte de pelo</SelectItem>
                  <SelectItem value="Tinte">Tinte</SelectItem>
                  <SelectItem value="Manicura">Manicura</SelectItem>
                  <SelectItem value="Afeitado">Afeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-duration" className="text-right">
                Duración
              </Label>
              <Select 
                value={formData.duration} 
                onValueChange={(value) => handleSelectChange(value, 'duration')}
              >
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notas
              </Label>
              <Input
                id="edit-notes"
                placeholder="Notas adicionales"
                value={formData.notes}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;
