
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
    const maxReconnectAttempts = 3;
    let reconnectTimeout: number | null = null;
    
    const connectSSE = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        const token = await getAccessTokenSilently();
        const baseUrl = import.meta.env.VITE_API_URL || "https://api.condamind.com";
        
        // Close any existing connection before creating a new one
        if (eventSource) {
          eventSource.close();
        }
        
        // Since vanilla EventSource doesn't support custom headers, we need to use a custom SSE implementation
        // or use a proxy endpoint that accepts the token in the URL (which is what the current system appears to do)
        
        // Create URL with authorization in header using fetch API to create a proxy SSE connection
        const url = `${baseUrl}/notifications/sse/human-needed`;
        
        // Using fetch with AbortController for manual SSE implementation with proper headers
        const controller = new AbortController();
        const { signal } = controller;
        
        fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
          signal,
        }).then(response => {
          if (!response.ok) {
            // Handle non-OK response (e.g., 401 Unauthorized)
            if (response.status === 401) {
              throw new Error('401 Unauthorized');
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          setError(null);
          setLoading(false);
          reconnectAttempts = 0;
          
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          
          // Function to process SSE events
          function processEvents() {
            reader.read().then(({ value, done }) => {
              if (done) {
                console.log('SSE stream closed');
                return;
              }
              
              buffer += decoder.decode(value, { stream: true });
              
              const lines = buffer.split('\n\n');
              buffer = lines.pop() || '';
              
              for (const line of lines) {
                if (line.trim() === '') continue;
                
                try {
                  const eventMatch = line.match(/^event: (.+)$/m);
                  const dataMatch = line.match(/^data: (.+)$/m);
                  
                  if (eventMatch && dataMatch) {
                    const eventType = eventMatch[1];
                    const data = dataMatch[1];
                    
                    console.log('SSE received:', eventType, data);
                    
                    if (eventType === 'initial') {
                      const initialCount = parseInt(data, 10);
                      setCount(initialCount);
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
                    }
                    else if (eventType === 'ping') {
                      console.log('SSE ping received');
                    }
                  }
                } catch (err) {
                  console.error('Error processing SSE data:', err);
                }
              }
              
              // Continue reading
              processEvents();
            }).catch(err => {
              console.error('Error reading SSE stream:', err);
              controller.abort();
              
              // Handle reconnection logic similar to the previous implementation
              handleReconnection(err);
            });
          }
          
          // Start processing events
          processEvents();
        }).catch(err => {
          console.error('Failed to establish SSE connection:', err);
          setError(err instanceof Error ? err : new Error('Unknown error connecting to notifications service'));
          setLoading(false);
          
          // Handle reconnection
          handleReconnection(err);
        });
        
        // Function to handle reconnection logic
        const handleReconnection = (err: any) => {
          // Don't auto-reconnect for auth errors (401)
          if (err instanceof Error && err.message.includes('401')) {
            console.error('Authentication error (401). Stopping reconnection attempts.');
            toast({
              title: "Error de autenticación",
              description: "No se pudo establecer conexión por falta de autenticación.",
              variant: "destructive"
            });
            return;
          }
          
          // Attempt to reconnect only if we haven't reached the maximum attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
            
            // Use exponential backoff
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
        
        return controller; // Return controller to allow abort on cleanup
      } catch (err) {
        console.error('Error setting up SSE connection:', err);
        setError(err instanceof Error ? err : new Error('Unknown error connecting to notifications service'));
        setLoading(false);
        return null;
      }
    };
    
    // Connect to SSE
    const controller = connectSSE();
    
    // Clean up on unmount
    return () => {
      if (controller) {
        controller.abort();
      }
      
      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
      }
    };
  }, [isAuthenticated, getAccessTokenSilently, count, playNotificationSound, onError, toast]);
  
  return { count, loading, error };
};
