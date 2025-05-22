
import { useState, useRef, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@/hooks/use-toast';
import { useSSEConnection } from './notifications/useSSEConnection';
import { useNotificationSound } from './notifications/useNotificationSound';
import { useDocumentTitle } from './notifications/useDocumentTitle';

interface UseHumanNeededCounterProps {
  onError?: (message: string) => void;
}

export const useHumanNeededCounter = ({ onError }: UseHumanNeededCounterProps = {}) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth0();
  const { toast } = useToast();
  const { playNotificationSound } = useNotificationSound();
  
  // Update document title based on count
  useDocumentTitle({ count });
  
  // Handle SSE messages
  const lastCount = useRef(0);
  const handleMessage = useCallback(
    (eventType: string, data: string) => {
      if (eventType === "initial" || eventType === "update") {
        try {
          const newCount = parseInt(data, 10);
          
          // Asegurarse de que newCount es un número válido antes de actualizar el estado
          if (!isNaN(newCount)) {
            if (newCount > lastCount.current) {
              playNotificationSound();
              toast({
                title: "Nuevas solicitudes pendientes",
                description: `Hay ${newCount} que requieren atención humana.`,
              });
            }
            
            lastCount.current = newCount;
            setCount(newCount);
            setLoading(false);
          } else {
            console.error("Recibido valor inválido para count:", data);
          }
        } catch (err) {
          console.error("Error parsing count data:", err, "Data received:", data);
        }
      }
    },
    [playNotificationSound, toast]
  );
  
  // Handle connection errors
  const handleError = useCallback((err: Error) => {
    setError(err);
    setLoading(false);
    if (onError) {
      onError(err.message);
    }
  }, [onError]);
  
  // Handle connection state changes
  const handleConnectionStateChange = useCallback((isConnected: boolean) => {
    if (!isConnected) {
      setLoading(false);
    }
  }, []);
  
  // Use SSE connection hook
  useSSEConnection({
    endpoint: '/notifications/sse/human-needed',
    onMessage: handleMessage,
    onError: handleError,
    onConnectionStateChange: handleConnectionStateChange
  });
  
  // Set loading state based on authentication
  if (!isAuthenticated && loading) {
    setLoading(false);
  }
  
  return { count, loading, error };
};
