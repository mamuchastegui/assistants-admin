
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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

// Storage keys
const APPOINTMENTS_STORAGE_KEY = 'appointments_data';

// Helper para guardar en localStorage
const saveToLocalStorage = (appointments: Appointment[]) => {
  localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
};

// Helper para obtener de localStorage
const getFromLocalStorage = (): Appointment[] => {
  const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Verificar si Supabase está disponible
const isSupabaseAvailable = () => {
  return !!supabase;
};

// Función para obtener todos los turnos
export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    if (isSupabaseAvailable()) {
      try {
        // Intentar usar Supabase primero
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: true })
          .order('time', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        return data as Appointment[] || [];
      } catch (error) {
        console.error("Error fetching from Supabase, falling back to localStorage:", error);
        return getFromLocalStorage();
      }
    } else {
      // Usar localStorage si Supabase no está disponible
      return getFromLocalStorage();
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
    toast.error("No se pudieron cargar los turnos");
    return [];
  }
};

// Función para crear un nuevo turno
export const createAppointment = async (appointment: AppointmentInput): Promise<Appointment | null> => {
  try {
    const newAppointment: Appointment = {
      ...appointment,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: appointment.status || 'confirmed'
    };

    if (isSupabaseAvailable()) {
      try {
        // Intentar usar Supabase primero
        const { data, error } = await supabase
          .from('appointments')
          .insert(newAppointment)
          .select('*')
          .single();
          
        if (error) {
          throw error;
        }
        
        toast.success("Turno creado correctamente");
        return data as Appointment;
      } catch (error) {
        console.error("Error creating in Supabase, falling back to localStorage:", error);
        const appointments = getFromLocalStorage();
        appointments.push(newAppointment);
        saveToLocalStorage(appointments);
        toast.success("Turno creado correctamente (modo local)");
        return newAppointment;
      }
    } else {
      // Usar localStorage si Supabase no está disponible
      const appointments = getFromLocalStorage();
      appointments.push(newAppointment);
      saveToLocalStorage(appointments);
      toast.success("Turno creado correctamente (modo local)");
      return newAppointment;
    }
  } catch (error) {
    console.error("Error creating appointment:", error);
    toast.error("No se pudo crear el turno");
    return null;
  }
};

// Función para actualizar un turno existente
export const updateAppointment = async (id: string, updatedFields: Partial<AppointmentInput>): Promise<Appointment | null> => {
  try {
    if (isSupabaseAvailable()) {
      try {
        // Intentar usar Supabase primero
        const { data, error } = await supabase
          .from('appointments')
          .update({
            ...updatedFields,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select('*')
          .single();
          
        if (error) {
          throw error;
        }
        
        toast.success("Turno actualizado correctamente");
        return data as Appointment;
      } catch (error) {
        console.error("Error updating in Supabase, falling back to localStorage:", error);
        // Fallback a localStorage
        const appointments = getFromLocalStorage();
        const updatedAppointments = appointments.map(app => 
          app.id === id 
            ? { 
                ...app, 
                ...updatedFields, 
                updated_at: new Date().toISOString() 
              } 
            : app
        );
        saveToLocalStorage(updatedAppointments);
        toast.success("Turno actualizado correctamente (modo local)");
        return updatedAppointments.find(app => app.id === id) || null;
      }
    } else {
      // Usar localStorage si Supabase no está disponible
      const appointments = getFromLocalStorage();
      const updatedAppointments = appointments.map(app => 
        app.id === id 
          ? { 
              ...app, 
              ...updatedFields, 
              updated_at: new Date().toISOString() 
            } 
          : app
      );
      saveToLocalStorage(updatedAppointments);
      toast.success("Turno actualizado correctamente (modo local)");
      return updatedAppointments.find(app => app.id === id) || null;
    }
  } catch (error) {
    console.error("Error updating appointment:", error);
    toast.error("No se pudo actualizar el turno");
    return null;
  }
};

// Función para eliminar un turno
export const deleteAppointment = async (id: string): Promise<boolean> => {
  try {
    if (isSupabaseAvailable()) {
      try {
        // Intentar usar Supabase primero
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
        console.error("Error deleting from Supabase, falling back to localStorage:", error);
        // Fallback a localStorage
        const appointments = getFromLocalStorage();
        const filteredAppointments = appointments.filter(app => app.id !== id);
        saveToLocalStorage(filteredAppointments);
        toast.success("Turno eliminado correctamente (modo local)");
        return true;
      }
    } else {
      // Usar localStorage si Supabase no está disponible
      const appointments = getFromLocalStorage();
      const filteredAppointments = appointments.filter(app => app.id !== id);
      saveToLocalStorage(filteredAppointments);
      toast.success("Turno eliminado correctamente (modo local)");
      return true;
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
    toast.error("No se pudo eliminar el turno");
    return false;
  }
};
