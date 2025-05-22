
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
        const newCount = parseInt(data, 10);
  
        if (newCount > lastCount.current) {
          playNotificationSound();
          toast({
            title: "Nuevas solicitudes pendientes",
            description: `Hay ${newCount} que requieren atención humana.`,
          });
        }
  
        lastCount.current = newCount;
        setCount(newCount);      // esto dispara un re-render, pero NO crea
                                 // una nueva versión de handleMessage
        setLoading(false);
      }
    },
    [playNotificationSound, toast]   // <- ¡count ya no está!
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
