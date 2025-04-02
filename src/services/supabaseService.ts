
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Interfaces para los datos
export interface Appointment {
  id: string;
  client: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export type AppointmentInput = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;

// Función para obtener todos los turnos
export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    toast.error("No se pudieron cargar los turnos");
    return [];
  }
};

// Función para crear un nuevo turno
export const createAppointment = async (appointment: AppointmentInput): Promise<Appointment | null> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select('*')
      .single();
      
    if (error) {
      throw error;
    }
    
    toast.success("Turno creado correctamente");
    return data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    toast.error("No se pudo crear el turno");
    return null;
  }
};

// Función para actualizar un turno existente
export const updateAppointment = async (id: string, updatedFields: Partial<AppointmentInput>): Promise<Appointment | null> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(updatedFields)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      throw error;
    }
    
    toast.success("Turno actualizado correctamente");
    return data;
  } catch (error) {
    console.error("Error updating appointment:", error);
    toast.error("No se pudo actualizar el turno");
    return null;
  }
};

// Función para eliminar un turno
export const deleteAppointment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    toast.success("Turno eliminado correctamente");
    return true;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    toast.error("No se pudo eliminar el turno");
    return false;
  }
};
