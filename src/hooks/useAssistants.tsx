
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuthApi } from "@/api/client";

export interface Assistant {
  _id: string;
  assistant_id: string;
  name: string;
  description?: string;
  model?: string;
  instructions?: string;
  tools?: any[];
  created_at: string;
  updated_at: string;
}

export function useAssistants() {
  const authApiClient = useAuthApi();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssistants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await authApiClient.get("/v1/assistants");
      
      setAssistants(data || []);
      
      // If there's only one assistant, select it automatically
      if (data && data.length === 1) {
        setSelectedAssistantId(data[0].assistant_id);
        localStorage.setItem('selectedAssistantId', data[0].assistant_id);
      } else if (data && data.length > 0) {
        // If there are multiple assistants, try to restore from localStorage or use the first one
        const savedAssistantId = localStorage.getItem('selectedAssistantId');
        const assistantExists = data.some(assistant => assistant.assistant_id === savedAssistantId);
        
        if (savedAssistantId && assistantExists) {
          setSelectedAssistantId(savedAssistantId);
        } else {
          setSelectedAssistantId(data[0].assistant_id);
          localStorage.setItem('selectedAssistantId', data[0].assistant_id);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching assistants:", err);
      setError("Error fetching assistants");
      setLoading(false);
      toast.error("No se pudieron cargar los asistentes");
    }
  }, [authApiClient]);

  const selectAssistant = useCallback((assistantId: string) => {
    setSelectedAssistantId(assistantId);
    localStorage.setItem('selectedAssistantId', assistantId);
  }, []);

  // Fetch assistants on mount
  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  return {
    assistants,
    selectedAssistantId,
    selectAssistant,
    loading,
    error,
    fetchAssistants
  };
}
