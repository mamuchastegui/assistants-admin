
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuthApi } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

export interface Assistant {
  _id?: string;
  assistant_id: string;
  name: string;
  last_name?: string;
  type?: string;
  profile_picture?: string;
  suggestions?: unknown;
  welcome_message?: string;
  welcome_messages?: string[];
  loading_messages?: string[];
  default?: boolean;
  validations?: Record<string, unknown>;
  llm?: string;
  model?: string;
  instructions?: string;
  initial_prompts_by_country?: unknown[];
  hide_first_message?: boolean;
  sufix_prompt?: string;
  regenerate_assistant_id?: string;
  max_regeneration_attempts?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export function useAssistants() {
  const authApiClient = useAuthApi();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  const fetchAssistants = useCallback(async () => {
    // Prevent duplicate fetches or retries after too many attempts
    if (loading || fetchAttempts > 3) return;
    
    try {
      setLoading(true);
      setError(null);
      setFetchAttempts(prev => prev + 1);

      console.log("Fetching assistants...");
      // Use absolute URL to prevent redirect issues
      const { data } = await authApiClient.get("/v1/assistants", {
        baseURL: import.meta.env.VITE_API_URL
      });
      
      console.log("Assistants fetched:", data);
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
      setFetchAttempts(0); // Reset attempts after successful fetch
    } catch (err) {
      console.error("Error fetching assistants:", err);
      setError("Error fetching assistants");
      setLoading(false);
      toast.error("No se pudieron cargar los asistentes");
    }
  }, [authApiClient, fetchAttempts]);

  const selectAssistant = useCallback((assistantId: string) => {
    setSelectedAssistantId(assistantId);
    localStorage.setItem('selectedAssistantId', assistantId);
  }, []);

  // Fetch assistants on mount only once, and only if authenticated
  useEffect(() => {
    // Only fetch if authenticated, not loading auth, haven't already loaded assistants, and not currently loading
    if (isAuthenticated && !isAuthLoading && assistants.length === 0 && !loading && fetchAttempts === 0) {
      fetchAssistants();
    }
  }, [fetchAssistants, assistants.length, loading, fetchAttempts, isAuthenticated, isAuthLoading]);

  return {
    assistants,
    selectedAssistantId,
    selectAssistant,
    loading,
    error,
    fetchAssistants
  };
}
