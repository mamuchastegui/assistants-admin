
import { toast } from "sonner";

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

// Simulación del servicio de Supabase (esto se reemplazará con la integración real de Supabase)
// Nota: Esta es una simulación temporal hasta que se conecte con Supabase

let appointments: Appointment[] = [
  {
    id: "1",
    client: "Ana García",
    service: "Corte de pelo",
    date: "2023-07-15",
    time: "09:00",
    duration: 30,
    status: "confirmed",
    notes: "Primera visita",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    client: "Carlos Rodríguez",
    service: "Tinte",
    date: "2023-07-15",
    time: "10:00",
    duration: 60,
    status: "confirmed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    client: "Laura Martínez",
    service: "Manicura",
    date: "2023-07-16",
    time: "11:00",
    duration: 45,
    status: "confirmed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Una vez que se conecte con Supabase, estas funciones se actualizarán para usar la API de Supabase
export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    // Simulando una petición a la API
    await new Promise(resolve => setTimeout(resolve, 500));
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    toast.error("No se pudieron cargar los turnos");
    return [];
  }
};

export const createAppointment = async (appointment: AppointmentInput): Promise<Appointment | null> => {
  try {
    // Log the appointment data being sent
    console.log("Creating appointment with data:", appointment);
    
    // Simulando una petición a la API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newAppointment: Appointment = {
      ...appointment,
      id: Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    toast.success("Turno creado correctamente");
    return newAppointment;
  } catch (error) {
    console.error("Error creating appointment:", error);
    toast.error("No se pudo crear el turno");
    return null;
  }
};

export const updateAppointment = async (id: string, updatedFields: Partial<AppointmentInput>): Promise<Appointment | null> => {
  try {
    // Log the update data being sent
    console.log("Updating appointment with data:", updatedFields);
    
    // Simulando una petición a la API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = appointments.findIndex(app => app.id === id);
    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    const updatedAppointment: Appointment = {
      ...appointments[index],
      ...updatedFields,
      updated_at: new Date().toISOString()
    };
    
    appointments[index] = updatedAppointment;
    toast.success("Turno actualizado correctamente");
    return updatedAppointment;
  } catch (error) {
    console.error("Error updating appointment:", error);
    toast.error("No se pudo actualizar el turno");
    return null;
  }
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
  try {
    // Simulando una petición a la API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const initialLength = appointments.length;
    appointments = appointments.filter(app => app.id !== id);
    
    if (appointments.length === initialLength) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    toast.success("Turno eliminado correctamente");
    return true;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    toast.error("No se pudo eliminar el turno");
    return false;
  }
};
