
import { toast } from "sonner";
import { supabase, isSupabaseAvailable } from "@/lib/supabase";

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

// LocalStorage keys
const STORAGE_KEY = 'appointments';

// Funciones de ayuda para localStorage
const getLocalAppointments = (): Appointment[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveLocalAppointments = (appointments: Appointment[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

// Genera un ID único simple para localStorage
const generateLocalId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Función para obtener todos los turnos
export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    // Si Supabase está disponible, usa Supabase
    if (isSupabaseAvailable()) {
      const { data, error } = await supabase!
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      return data || [];
    } 
    
    // Fallback a localStorage
    return getLocalAppointments();
  } catch (error) {
    console.error("Error fetching appointments:", error);
    toast.error("No se pudieron cargar los turnos");
    // Fallback a localStorage en caso de error
    return getLocalAppointments();
  }
};

// Función para crear un nuevo turno
export const createAppointment = async (appointment: AppointmentInput): Promise<Appointment | null> => {
  try {
    const now = new Date().toISOString();
    
    // Si Supabase está disponible, usa Supabase
    if (isSupabaseAvailable()) {
      const { data, error } = await supabase!
        .from('appointments')
        .insert({
          ...appointment,
          created_at: now,
          updated_at: now
        })
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success("Turno creado correctamente");
      return data;
    }
    
    // Fallback a localStorage
    const newAppointment: Appointment = {
      id: generateLocalId(),
      ...appointment,
      created_at: now,
      updated_at: now
    };
    
    const appointments = getLocalAppointments();
    appointments.push(newAppointment);
    saveLocalAppointments(appointments);
    
    toast.success("Turno creado correctamente (modo local)");
    return newAppointment;
  } catch (error) {
    console.error("Error creating appointment:", error);
    toast.error("No se pudo crear el turno");
    return null;
  }
};

// Función para actualizar un turno existente
export const updateAppointment = async (id: string, updatedFields: Partial<AppointmentInput>): Promise<Appointment | null> => {
  try {
    const now = new Date().toISOString();
    
    // Si Supabase está disponible, usa Supabase
    if (isSupabaseAvailable()) {
      const { data, error } = await supabase!
        .from('appointments')
        .update({
          ...updatedFields,
          updated_at: now
        })
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success("Turno actualizado correctamente");
      return data;
    }
    
    // Fallback a localStorage
    const appointments = getLocalAppointments();
    const index = appointments.findIndex(app => app.id === id);
    
    if (index !== -1) {
      appointments[index] = {
        ...appointments[index],
        ...updatedFields,
        updated_at: now
      };
      
      saveLocalAppointments(appointments);
      toast.success("Turno actualizado correctamente (modo local)");
      return appointments[index];
    }
    
    return null;
  } catch (error) {
    console.error("Error updating appointment:", error);
    toast.error("No se pudo actualizar el turno");
    return null;
  }
};

// Función para eliminar un turno
export const deleteAppointment = async (id: string): Promise<boolean> => {
  try {
    // Si Supabase está disponible, usa Supabase
    if (isSupabaseAvailable()) {
      const { error } = await supabase!
        .from('appointments')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Turno eliminado correctamente");
      return true;
    }
    
    // Fallback a localStorage
    const appointments = getLocalAppointments();
    const filteredAppointments = appointments.filter(app => app.id !== id);
    
    if (filteredAppointments.length !== appointments.length) {
      saveLocalAppointments(filteredAppointments);
      toast.success("Turno eliminado correctamente (modo local)");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    toast.error("No se pudo eliminar el turno");
    return false;
  }
};
