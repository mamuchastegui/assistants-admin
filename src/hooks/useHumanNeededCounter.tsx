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
    
    const connectSSE = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        const token = await getAccessTokenSilently();
        const baseUrl = import.meta.env.VITE_API_URL || "https://api.condamind.com";
        const url = `${baseUrl}/notifications/sse/human-needed`;
        
        // Create EventSource for SSE with token
        const headers = new Headers({
          'Authorization': `Bearer ${token}`
        });
        
        // Create URL with authorization in query parameter (since EventSource doesn't support custom headers)
        const eventSourceUrl = new URL(url);
        eventSourceUrl.searchParams.append('authorization', `Bearer ${token}`);
        
        // Create and configure EventSource
        eventSource = new EventSource(eventSourceUrl.toString());
        
        eventSource.onopen = () => {
          console.log('SSE connection established');
          setLoading(false);
          setError(null);
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
          const errorMessage = 'Error en la conexión de notificaciones';
          setError(new Error(errorMessage));
          
          if (onError) {
            onError(errorMessage);
          }
          
          // Close current connection
          if (eventSource) {
            eventSource.close();
          }
          
          // Attempt to reconnect after a delay
          setTimeout(() => {
            connectSSE();
          }, 5000);
        };
      } catch (err) {
        console.error('Failed to establish SSE connection:', err);
        setError(err instanceof Error ? err : new Error('Unknown error connecting to notifications service'));
        setLoading(false);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          connectSSE();
        }, 5000);
      }
    };
    
    connectSSE();
    
    // Clean up on unmount
    return () => {
      if (eventSource) {
        console.log('Closing SSE connection');
        eventSource.close();
      }
    };
  }, [isAuthenticated, getAccessTokenSilently, count, playNotificationSound, onError, toast]);
  
  return { count, loading, error };
};
