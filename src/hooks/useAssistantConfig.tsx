
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface AssistantConfig {
  _id?: string;
  name: string;
  businessDescription: string;
  isActive: boolean;
  notifyOwner: boolean;
  allowHumanIntervention: boolean;
  welcomeMessage: string;
  awayMessage: string;
  bookingConfirmation: string;
  reminderMessage: string;
  followupMessage: string;
  quickResponses: {
    id: number;
    trigger: string;
    response: string;
  }[];
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export function useAssistantConfig() {
  const [config, setConfig] = useState<AssistantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('whatsapp-messages', {
        body: { action: 'getAssistants' }
      });

      if (error) throw new Error(error.message);

      const assistants = data as AssistantConfig[];
      // Tomamos la primera configuración o creamos una por defecto
      const config = assistants.length > 0 ? assistants[0] : createDefaultConfig();
      
      setConfig(config);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching assistant config:", err);
      setError(err.message);
      setLoading(false);
      toast.error("No se pudo cargar la configuración del asistente");
      
      // Configuración por defecto en caso de error
      setConfig(createDefaultConfig());
    }
  }, []);

  const saveConfig = async (updatedConfig: AssistantConfig) => {
    try {
      setSaving(true);
      setError(null);

      // Actualizar las marcas de tiempo
      updatedConfig.updatedAt = new Date().toISOString();
      if (!updatedConfig.createdAt) {
        updatedConfig.createdAt = new Date().toISOString();
      }

      const { data, error } = await supabase.functions.invoke('whatsapp-messages', {
        body: { 
          action: 'updateAssistant',
          config: updatedConfig 
        }
      });

      if (error) throw new Error(error.message);

      setConfig(updatedConfig);
      setSaving(false);
      toast.success("Configuración guardada correctamente");
      return true;
    } catch (err) {
      console.error("Error saving assistant config:", err);
      setError(err.message);
      setSaving(false);
      toast.error("No se pudo guardar la configuración");
      return false;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, saving, error, saveConfig, refreshConfig: fetchConfig };
}

// Función para crear una configuración por defecto
function createDefaultConfig(): AssistantConfig {
  return {
    name: "Asistente Virtual",
    businessDescription: "Somos una peluquería con más de 10 años de experiencia ofreciendo servicios de calidad.",
    isActive: true,
    notifyOwner: true,
    allowHumanIntervention: true,
    welcomeMessage: "¡Hola! Soy el asistente virtual de [Nombre del Negocio]. ¿En qué puedo ayudarte hoy?",
    awayMessage: "Gracias por tu mensaje. En este momento estamos fuera de horario de atención. Te responderemos cuando regresemos.",
    bookingConfirmation: "¡Tu reserva ha sido confirmada! Te esperamos el [fecha] a las [hora]. Si necesitas hacer algún cambio, házmelo saber.",
    reminderMessage: "¡Hola! Te recordamos que tienes una cita mañana a las [hora]. ¡Te esperamos!",
    followupMessage: "¡Hola! Esperamos que hayas disfrutado de nuestro servicio. Nos encantaría conocer tu opinión. ¿Podrías calificarnos del 1 al 5?",
    quickResponses: [
      { id: 1, trigger: "hola", response: "¡Hola! ¿En qué puedo ayudarte hoy?" },
      { id: 2, trigger: "horarios", response: "Nuestro horario de atención es de lunes a viernes de 9:00 a 20:00 y sábados de 10:00 a 18:00." },
      { id: 3, trigger: "precios", response: "Puedes consultar nuestros precios en nuestra página web o te puedo dar información sobre algún servicio específico." },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
