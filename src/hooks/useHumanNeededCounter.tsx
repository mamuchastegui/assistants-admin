
import { useEffect, useState, useCallback, useRef } from 'react';
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
  
  // Reference to track active connection
  const connectionRef = useRef<{
    controller: AbortController | null;
    isConnecting: boolean;
  }>({ controller: null, isConnecting: false });
  
  // Reference to track retry timing
  const retryTimerRef = useRef<number | null>(null);
  
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
  
  // Function to abort current connection
  const abortCurrentConnection = useCallback(() => {
    if (connectionRef.current.controller) {
      connectionRef.current.controller.abort();
      connectionRef.current.controller = null;
    }
    
    // Clear any pending retry timer
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    
    connectionRef.current.isConnecting = false;
  }, []);
  
  // Function to establish SSE connection
  const connectSSE = useCallback(async () => {
    // Avoid multiple simultaneous connection attempts
    if (connectionRef.current.isConnecting || !isAuthenticated) {
      if (!isAuthenticated) setLoading(false);
      return;
    }
    
    // Mark as connecting to prevent multiple parallel connections
    connectionRef.current.isConnecting = true;
    
    try {
      console.log('Establishing SSE connection...');
      const token = await getAccessTokenSilently();
      const baseUrl = import.meta.env.VITE_API_URL || "https://api.condamind.com";
      
      // Abort any existing connection
      abortCurrentConnection();
      
      // Create a new AbortController for this connection
      const controller = new AbortController();
      connectionRef.current.controller = controller;
      
      // Create URL with proper headers for authorization
      const url = `${baseUrl}/notifications/sse/human-needed`;
      
      // Using fetch with AbortController for manual SSE implementation
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        signal: controller.signal,
      }).then(response => {
        if (!response.ok) {
          // Handle non-OK response (e.g., 401 Unauthorized)
          if (response.status === 401) {
            throw new Error('401 Unauthorized');
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        console.log('SSE connection established successfully');
        setError(null);
        setLoading(false);
        connectionRef.current.isConnecting = false;
        
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        // Function to process SSE events
        function processEvents() {
          reader.read().then(({ value, done }) => {
            if (done) {
              console.log('SSE stream closed normally');
              // Consider this a normal close, not an error
              connectionRef.current.isConnecting = false;
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
            if (err.name === 'AbortError') {
              console.log('SSE connection aborted intentionally');
              return;
            }
            
            console.error('Error reading SSE stream:', err);
            scheduleReconnect(err);
          });
        }
        
        // Start processing events
        processEvents();
        
      }).catch(err => {
        console.error('Failed to establish SSE connection:', err);
        setError(err instanceof Error ? err : new Error('Unknown error connecting to notifications service'));
        setLoading(false);
        
        scheduleReconnect(err);
      });
      
    } catch (err) {
      console.error('Error setting up SSE connection:', err);
      setError(err instanceof Error ? err : new Error('Unknown error connecting to notifications service'));
      setLoading(false);
      
      scheduleReconnect(err);
    }
  }, [isAuthenticated, getAccessTokenSilently, count, playNotificationSound, toast, abortCurrentConnection]);
  
  // Function to schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback((err: any) => {
    // Don't auto-reconnect for auth errors (401)
    if (err instanceof Error && err.message.includes('401')) {
      console.error('Authentication error (401). Stopping reconnection attempts.');
      connectionRef.current.isConnecting = false;
      toast({
        title: "Error de autenticación",
        description: "No se pudo establecer conexión por falta de autenticación.",
        variant: "destructive"
      });
      return;
    }
    
    // Clear any existing retry timer
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
    }
    
    // Use a fixed 5-second reconnect delay as requested
    const reconnectDelay = 5000; // 5 seconds between reconnect attempts
    
    console.log(`Scheduling reconnection attempt in ${reconnectDelay/1000} seconds`);
    
    connectionRef.current.isConnecting = false;
    retryTimerRef.current = window.setTimeout(() => {
      connectSSE();
    }, reconnectDelay);
  }, [connectSSE, toast]);
  
  // Initialize connection
  useEffect(() => {
    // Initial connection
    connectSSE();
    
    // Clean up on unmount
    return () => {
      abortCurrentConnection();
    };
  }, [isAuthenticated, connectSSE, abortCurrentConnection]);
  
  return { count, loading, error };
};
