
import { useState, useCallback } from 'react';
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
  const handleMessage = useCallback((eventType: string, data: string) => {
    if (eventType === 'initial') {
      const initialCount = parseInt(data, 10);
      setCount(initialCount);
      setLoading(false);
    }
    else if (eventType === 'update') {
      const newCount = parseInt(data, 10);
      
      // Play sound only if count increases
      if (newCount > count) {
        playNotificationSound();
        toast({
          title: "Nuevas solicitudes pendientes",
          description: `Hay ${newCount} solicitudes que requieren atención humana.`,
        });
      }
      
      setCount(newCount);
      setLoading(false);
    }
    else if (eventType === 'ping') {
      console.log('SSE ping received');
    }
  }, [count, playNotificationSound, toast]);
  
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
