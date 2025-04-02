
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  Appointment,
  AppointmentInput
} from "@/services/supabaseService";
import { format } from "date-fns";

// Types
export interface AppointmentFormData {
  client: string;
  service: string;
  time: string;
  duration: string;
  notes?: string;
}

export const useAppointments = (selectedDate: Date) => {
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
  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });
  
  const createMutation = useMutation({
    mutationFn: (data: AppointmentInput) => {
      console.log("Mutation data:", data);
      return createAppointment(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      resetForm();
      toast.success("Turno creado exitosamente");
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AppointmentInput> }) => {
      return updateAppointment(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      resetForm();
      toast.success("Turno actualizado exitosamente");
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return deleteAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Turno eliminado exitosamente");
    },
  });

  // Filter appointments for selected date
  const filteredAppointments = appointments 
    ? appointments
        .filter(app => app.date === format(selectedDate, "yyyy-MM-dd"))
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  // Form helpers
  const resetForm = () => {
    setFormData({
      client: "",
      service: "",
      time: "09:00",
      duration: "30",
      notes: "",
    });
    setCurrentAppointment(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('edit-', '')]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveNew = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const appointmentData: AppointmentInput = {
      client: formData.client,
      service: formData.service,
      date: dateStr,
      time: formData.time,
      duration: parseInt(formData.duration),
      notes: formData.notes,
      status: "confirmed"
    };
    
    createMutation.mutate(appointmentData);
  };

  const handleSaveEdit = () => {
    if (!currentAppointment) return;
    
    const appointmentData: Partial<AppointmentInput> = {
      client: formData.client,
      service: formData.service,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: formData.time,
      duration: parseInt(formData.duration),
      notes: formData.notes,
      status: "confirmed"
    };
    
    updateMutation.mutate({ 
      id: currentAppointment, 
      data: appointmentData 
    });
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
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este turno?")) {
      deleteMutation.mutate(id);
    }
  };

  return {
    filteredAppointments,
    isLoading,
    formData,
    currentAppointment,
    refetch,
    createMutation,
    updateMutation,
    resetForm,
    handleFormChange,
    handleSelectChange,
    handleSaveNew,
    handleSaveEdit,
    handleEdit,
    handleDelete,
    setCurrentAppointment
  };
};
