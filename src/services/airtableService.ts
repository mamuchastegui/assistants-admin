
import { toast } from "sonner";

const AIRTABLE_API_KEY = "patTbANbkSDsfeOFv.1dd2478a56fc9c96962ee20afffd559f50f65325dec80b3b9e1f409464b38922";
const AIRTABLE_BASE_ID = "appAsWTec0UdWk2nF";
const AIRTABLE_TABLE_NAME = "ClientAppointments";

export interface AirtableAppointment {
  id: string;
  fields: {
    Name: string;
    Service: string;
    Date: string; // Formato ISO "2023-07-15"
    Time: string; // Formato "09:00"
    Duration: number;
    Notes?: string;
    Status?: string;
  };
}

export const fetchAppointments = async (): Promise<AirtableAppointment[]> => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records as AirtableAppointment[];
  } catch (error) {
    console.error("Error fetching appointments from Airtable:", error);
    toast.error("No se pudieron cargar los turnos desde Airtable");
    return [];
  }
};

export const createAppointment = async (appointment: Omit<AirtableAppointment['fields'], 'id'>): Promise<AirtableAppointment | null> => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: appointment
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al crear turno: ${response.statusText}`);
    }

    const data = await response.json();
    toast.success("Turno creado correctamente");
    return data as AirtableAppointment;
  } catch (error) {
    console.error("Error creating appointment in Airtable:", error);
    toast.error("No se pudo crear el turno en Airtable");
    return null;
  }
};

export const updateAppointment = async (id: string, fields: Partial<AirtableAppointment['fields']>): Promise<AirtableAppointment | null> => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al actualizar turno: ${response.statusText}`);
    }

    const data = await response.json();
    toast.success("Turno actualizado correctamente");
    return data as AirtableAppointment;
  } catch (error) {
    console.error("Error updating appointment in Airtable:", error);
    toast.error("No se pudo actualizar el turno en Airtable");
    return null;
  }
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al eliminar turno: ${response.statusText}`);
    }

    toast.success("Turno eliminado correctamente");
    return true;
  } catch (error) {
    console.error("Error deleting appointment from Airtable:", error);
    toast.error("No se pudo eliminar el turno de Airtable");
    return false;
  }
};

// Función para convertir objetos de Airtable al formato de la app
export const mapAirtableToAppointment = (airtableAppointment: AirtableAppointment) => {
  return {
    id: airtableAppointment.id,
    time: airtableAppointment.fields.Time,
    client: airtableAppointment.fields.Name,
    service: airtableAppointment.fields.Service,
    duration: airtableAppointment.fields.Duration,
    date: airtableAppointment.fields.Date,
    notes: airtableAppointment.fields.Notes,
    status: airtableAppointment.fields.Status,
  };
};

// Función para convertir objetos de la app al formato de Airtable
export const mapAppointmentToAirtable = (appointment: {
  client: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  status?: string;
}) => {
  return {
    Name: appointment.client,
    Service: appointment.service,
    Date: appointment.date,
    Time: appointment.time,
    Duration: appointment.duration,
    Notes: appointment.notes,
    Status: appointment.status,
  };
};
