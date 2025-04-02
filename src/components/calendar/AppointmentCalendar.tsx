
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Import components
import CalendarSidebar from "./CalendarSidebar";
import AppointmentList from "./appointment/AppointmentList";
import AppointmentForm from "./appointment/AppointmentForm";

// Import services
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  mapAirtableToAppointment,
  mapAppointmentToAirtable
} from "@/services/airtableService";

// Types
interface AppointmentFormData {
  client: string;
  service: string;
  time: string;
  duration: string;
  notes?: string;
}

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

const AppointmentCalendar: React.FC = () => {
  // State
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
  
  // Queries and Mutations
  const { data: airtableAppointments, isLoading, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });
  
  const createMutation = useMutation({
    mutationFn: (data: ReturnType<typeof mapAppointmentToAirtable>) => {
      console.log("Mutation data:", data);
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

  // Filter appointments for selected date
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

  // Event handlers
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
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
    
    console.log("Saving new appointment:", appointmentData);
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
    
    console.log("Saving edit to appointment:", appointmentData);
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
      {/* Calendar sidebar */}
      <CalendarSidebar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onSyncWithAirtable={syncWithAirtable}
        isLoading={isLoading}
      />

      {/* Appointments list */}
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
              <AppointmentForm
                title="Nuevo Turno"
                description="Completa los detalles para crear un nuevo turno"
                formData={formData}
                selectedDate={selectedDate}
                isLoading={createMutation.isPending}
                onFormChange={handleFormChange}
                onSelectChange={handleSelectChange}
                onSubmit={handleSaveNew}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <AppointmentList
            appointments={filteredAppointments}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={() => setIsNewAppointmentOpen(true)}
          />
        </CardContent>
      </Card>

      {/* Edit appointment dialog */}
      <Dialog open={isEditAppointmentOpen} onOpenChange={setIsEditAppointmentOpen}>
        <AppointmentForm
          title="Editar Turno"
          description="Actualiza los detalles del turno"
          formData={formData}
          selectedDate={selectedDate}
          isLoading={updateMutation.isPending}
          onFormChange={handleFormChange}
          onSelectChange={handleSelectChange}
          onSubmit={handleSaveEdit}
          idPrefix="edit"
        />
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;
