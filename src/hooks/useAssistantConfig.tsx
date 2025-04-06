
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface QuickResponse {
  id: number;
  trigger: string;
  response: string;
}

export interface AssistantConfig {
  id: string;
  name: string;
  isActive: boolean;
  businessDescription: string;
  welcomeMessage: string;
  awayMessage: string;
  bookingConfirmation: string;
  reminderMessage: string;
  followupMessage: string;
  notifyOwner: boolean;
  allowHumanIntervention: boolean;
  quickResponses: QuickResponse[];
}

export function useAssistantConfig() {
  const [config, setConfig] = useState<AssistantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Since there is no actual API endpoint for assistant config, 
      // we'll create mock data instead
      setTimeout(() => {
        const mockConfig: AssistantConfig = {
          id: "conf_1",
          name: "Asistente Virtual",
          isActive: true,
          businessDescription: "Restaurante de comida española en el centro de Madrid. Ofrecemos menú del día y carta con especialidades tradicionales.",
          welcomeMessage: "¡Hola! Soy el asistente virtual del Restaurante La Tapería. ¿En qué puedo ayudarte hoy?",
          awayMessage: "Gracias por tu mensaje. En este momento estamos fuera del horario de atención. Te responderemos lo antes posible durante nuestro horario habitual (L-V: 9h-18h).",
          bookingConfirmation: "¡Tu reserva ha sido confirmada! Te esperamos el {fecha} a las {hora} para {personas} personas. Para cancelar o modificar, responde a este mensaje.",
          reminderMessage: "Te recordamos que tienes una reserva mañana a las {hora} para {personas} personas. ¡Te esperamos!",
          followupMessage: "Gracias por visitarnos. Esperamos que hayas disfrutado de tu experiencia. ¿Podrías dejarnos una reseña? Tu opinión es muy importante para nosotros.",
          notifyOwner: true,
          allowHumanIntervention: true,
          quickResponses: [
            {
              id: 1,
              trigger: "horario",
              response: "Nuestro horario es de lunes a viernes de 12:00 a 16:00 y de 20:00 a 23:30. Sábados y domingos de 13:00 a 17:00 y de 20:00 a 00:00."
            },
            {
              id: 2,
              trigger: "menú",
              response: "Nuestro menú del día incluye primer plato, segundo plato, postre y bebida por 15,50€. Puedes consultarlo completo en nuestra web."
            },
            {
              id: 3,
              trigger: "reserva",
              response: "Para hacer una reserva, necesitaría saber: fecha, hora, número de personas y si tienes alguna preferencia o necesidad especial. ¿Me podrías facilitar estos datos?"
            }
          ]
        };
        
        setConfig(mockConfig);
        setLoading(false);
      }, 1000); // Simulate network delay
      
    } catch (err) {
      console.error("Error fetching assistant config:", err);
      setError("Failed to load configuration");
      setLoading(false);
      toast.error("No se pudo cargar la configuración del asistente");
    }
  }, []);

  const saveConfig = useCallback(async (updatedConfig: AssistantConfig) => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConfig(updatedConfig);
      setSaving(false);
      return true;
    } catch (err) {
      console.error("Error saving assistant config:", err);
      toast.error("Error al guardar la configuración");
      setSaving(false);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, saving, error, saveConfig };
}
