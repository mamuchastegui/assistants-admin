
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from './useDocumentTitle';
import { useHumanNeededEvents } from './useHumanNeededEvents';
import { subscribeToHumanNeeded } from './eventSourceSubscriber';
import { UseHumanNeededCounterProps, UseHumanNeededCounterResult } from './types/humanNeededTypes';

/**
 * Hook that tracks the number of requests that need human attention
 */
export const useHumanNeededCounter = ({ 
  assistantId,
  onError 
}: UseHumanNeededCounterProps = {}): UseHumanNeededCounterResult => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated, getAccessTokenSilently } = useAuth();
  const { handleMessage } = useHumanNeededEvents();
  
  // Update document title based on count
  useDocumentTitle({ count });
  
  // Process incoming SSE messages
  const processMessage = useCallback((eventType: string, data: string) => {
    const newCount = handleMessage(eventType, data);
    if (newCount !== null) {
      setCount(newCount);
      setLoading(false);
    }
  }, [handleMessage]);
  
  // EventSource instance reference
  const eventSourceRef = useRef<EventSource | null>(null);

  // Referencia a la suscripción para poder cerrarla
  const subscriptionRef = useRef<{ close: () => void } | null>(null);

  // Establish EventSource connection
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const connect = async () => {
      try {
        const token = await getAccessTokenSilently();
        const subscription = subscribeToHumanNeeded({
          token,
          assistantId,
          onMessage: processMessage,
          onError: (err) => {
            if (!isMounted) return;
            const error = err instanceof Event ? new Error('SSE connection error') : err as any;
            setError(error as Error);
            setLoading(false);
            onError?.((error as Error).message);
          },
          // Función para renovar el token cuando expire
          refreshToken: async () => {
            return await getAccessTokenSilently({ cacheMode: 'off' });
          }
        });

        subscriptionRef.current = subscription;
        eventSourceRef.current = subscription.source;
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err);
        setLoading(false);
        onError?.(err.message);
      }
    };

    connect();

    return () => {
      isMounted = false;
      // Usar la referencia de suscripción para cerrar correctamente
      subscriptionRef.current?.close();
      subscriptionRef.current = null;
      eventSourceRef.current = null;
    };
  }, [assistantId, isAuthenticated, getAccessTokenSilently, processMessage, onError]);
  
  // Set loading state based on authentication
  if (!isAuthenticated && loading) {
    setLoading(false);
  }
  
  return { count, loading, error };
};
