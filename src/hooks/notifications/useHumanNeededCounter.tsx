
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSSEConnection } from './useSSEConnection';
import { useDocumentTitle } from './useDocumentTitle';
import { useHumanNeededEvents } from './useHumanNeededEvents';
import { UseHumanNeededCounterProps, UseHumanNeededCounterResult } from './types/humanNeededTypes';

/**
 * Hook that tracks the number of requests that need human attention
 */
export const useHumanNeededCounter = ({ onError }: UseHumanNeededCounterProps = {}): UseHumanNeededCounterResult => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();
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
    onMessage: processMessage,
    onError: handleError,
    onConnectionStateChange: handleConnectionStateChange
  });
  
  // Set loading state based on authentication
  if (!isAuthenticated && loading) {
    setLoading(false);
  }
  
  return { count, loading, error };
};
