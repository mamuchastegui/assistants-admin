import { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@/hooks/use-toast';

interface UseHumanNeededCounterProps {
  onError?: (message: string) => void;
}

export const useHumanNeededCounter = ({ onError }: UseHumanNeededCounterProps = {}) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { toast } = useToast();
  
  // Notification sound setup
  const notificationSound = new Audio('/notification.mp3');
  
  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    notificationSound.currentTime = 0;
    notificationSound.play().catch(err => console.log('Error playing notification sound:', err));
  }, [notificationSound]);
  
  // Update document title based on count
  useEffect(() => {
    if (count > 0) {
      document.title = `(${count}) Solicitudes Pendientes | CONDAMIND`;
    } else {
      document.title = 'CONDAMIND Assistants';
    }
    
    return () => {
      document.title = 'CONDAMIND Assistants';
    };
  }, [count]);
  
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3; // Limit reconnect attempts
    let reconnectTimeout: number | null = null;
    
    const connectSSE = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        const token = await getAccessTokenSilently();
        const baseUrl = import.meta.env.VITE_API_URL || "https://api.condamind.com";
        const url = `${baseUrl}/notifications/sse/human-needed`;
        
        // Close any existing connection before creating a new one
        if (eventSource) {
          eventSource.close();
        }
        
        // Create URL with authorization in query parameter (since EventSource doesn't support custom headers)
        const eventSourceUrl = new URL(url);
        eventSourceUrl.searchParams.append('authorization', `Bearer ${token}`);
        
        // Create and configure EventSource
        eventSource = new EventSource(eventSourceUrl.toString());
        
        eventSource.onopen = () => {
          console.log('SSE connection established');
          setLoading(false);
          setError(null);
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };
        
        // Handle initial count event
        eventSource.addEventListener('initial', (event) => {
          const initialCount = parseInt(event.data, 10);
          setCount(initialCount);
          setLoading(false);
        });
        
        // Handle update events when count changes
        eventSource.addEventListener('update', (event) => {
          const newCount = parseInt(event.data, 10);
          
          // Play sound only if count increases
          if (newCount > count) {
            playNotificationSound();
            toast({
              title: "Nuevas solicitudes pendientes",
              description: `Hay ${newCount} solicitudes que requieren atención humana.`,
            });
          }
          
          setCount(newCount);
        });
        
        // Keep connection alive with ping events
        eventSource.addEventListener('ping', () => {
          console.log('SSE ping received');
        });
        
        // Handle connection errors
        eventSource.onerror = (event) => {
          console.error('SSE connection error:', event);
          
          // Close current connection
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          
          const errorMessage = 'Error en la conexión de notificaciones';
          setError(new Error(errorMessage));
          
          if (onError) {
            onError(errorMessage);
          }
          
          // Check if we should attempt to reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
            
            // Attempt to reconnect after a delay with exponential backoff
            const reconnectDelay = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 30000);
            
            if (reconnectTimeout) {
              window.clearTimeout(reconnectTimeout);
            }
            
            reconnectTimeout = window.setTimeout(() => {
              connectSSE();
            }, reconnectDelay);
          } else {
            console.error('Maximum reconnect attempts reached. Stopping reconnection.');
            toast({
              title: "Error de conexión",
              description: "No se pudo establecer conexión con el servidor de notificaciones.",
              variant: "destructive"
            });
          }
        };
      } catch (err) {
        console.error('Failed to establish SSE connection:', err);
        setError(err instanceof Error ? err : new Error('Unknown error connecting to notifications service'));
        setLoading(false);
        
        // Don't auto-reconnect for auth errors (401)
        if (err instanceof Error && err.message.includes('401')) {
          console.error('Authentication error (401). Stopping reconnection attempts.');
          return;
        }
        
        // Attempt to reconnect only if we haven't reached the maximum attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const reconnectDelay = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 30000);
          
          if (reconnectTimeout) {
            window.clearTimeout(reconnectTimeout);
          }
          
          reconnectTimeout = window.setTimeout(() => {
            connectSSE();
          }, reconnectDelay);
        }
      }
    };
    
    connectSSE();
    
    // Clean up on unmount
    return () => {
      if (eventSource) {
        console.log('Closing SSE connection');
        eventSource.close();
      }
      
      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
      }
    };
  }, [isAuthenticated, getAccessTokenSilently, count, playNotificationSound, onError, toast]);
  
  return { count, loading, error };
};
