
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
    reconnectAttempts: number;
    activeConnection: boolean;
  }>({ 
    controller: null, 
    isConnecting: false, 
    reconnectAttempts: 0,
    activeConnection: false
  });
  
  // Reference to track retry timing
  const retryTimerRef = useRef<number | null>(null);
  
  // Flag to track if component is mounted
  const isMountedRef = useRef<boolean>(true);
  
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
  
  // Set mounted flag on cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
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
    connectionRef.current.activeConnection = false;
  }, []);
  
  // Function to establish SSE connection
  const connectSSE = useCallback(async () => {
    // Don't attempt to connect if component is unmounted
    if (!isMountedRef.current) {
      return;
    }
    
    // Avoid multiple simultaneous connection attempts
    if (connectionRef.current.isConnecting || connectionRef.current.activeConnection || !isAuthenticated) {
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
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        signal: controller.signal,
      });
        
      // Don't proceed if component is unmounted
      if (!isMountedRef.current) {
        abortCurrentConnection();
        return;
      }
      
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
      connectionRef.current.activeConnection = true;
      connectionRef.current.reconnectAttempts = 0; // Reset attempt counter on success
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      // Function to process SSE events
      async function processEvents() {
        // Don't continue reading if component is unmounted
        if (!isMountedRef.current || !connectionRef.current.activeConnection) return;
        
        try {
          const { value, done } = await reader.read();
          
          // Don't process if component is unmounted
          if (!isMountedRef.current || !connectionRef.current.activeConnection) return;
          
          if (done) {
            console.log('SSE stream closed normally');
            // Consider this a normal close, not an error
            connectionRef.current.isConnecting = false;
            connectionRef.current.activeConnection = false;
            
            // Schedule reconnect for normal closures
            if (isMountedRef.current) {
              scheduleReconnect(new Error('Stream closed normally'));
            }
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
          
          // Continue reading only if component is still mounted and connection is active
          if (isMountedRef.current && connectionRef.current.activeConnection) {
            processEvents();
          }
        } catch (err) {
          // Don't proceed if component is unmounted
          if (!isMountedRef.current) return;
          
          if (err.name === 'AbortError') {
            console.log('SSE connection aborted intentionally');
            return;
          }
          
          console.error('Error reading SSE stream:', err);
          connectionRef.current.activeConnection = false;
          scheduleReconnect(err);
        }
      }
      
      // Start processing events
      if (isMountedRef.current) {
        processEvents();
      }
      
    } catch (err) {
      // Don't proceed if component is unmounted
      if (!isMountedRef.current) return;
      
      console.error('Failed to establish SSE connection:', err);
      setError(err instanceof Error ? err : new Error('Unknown error connecting to notifications service'));
      setLoading(false);
      connectionRef.current.activeConnection = false;
      
      // Only schedule reconnect if not aborted intentionally
      if (err.name !== 'AbortError') {
        scheduleReconnect(err);
      }
    } finally {
      // Reset connecting flag regardless of outcome
      connectionRef.current.isConnecting = false;
    }
  }, [isAuthenticated, getAccessTokenSilently, count, playNotificationSound, toast, abortCurrentConnection]);
  
  // Function to schedule reconnection with fixed delay
  const scheduleReconnect = useCallback((err: any) => {
    // Don't schedule reconnection if component is unmounted
    if (!isMountedRef.current) {
      return;
    }
    
    // Mark connection as not connecting or active
    connectionRef.current.isConnecting = false;
    connectionRef.current.activeConnection = false;
    
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
    
    // Clear any existing retry timer
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    
    // Increment reconnection attempt counter
    connectionRef.current.reconnectAttempts += 1;
    
    // Use a fixed 5-second reconnect delay
    const reconnectDelay = 5000; // 5 seconds between reconnect attempts
    
    console.log(`Scheduling reconnection attempt in ${reconnectDelay/1000} seconds (attempt ${connectionRef.current.reconnectAttempts})`);
    
    // Only schedule reconnection if component is still mounted
    if (isMountedRef.current) {
      retryTimerRef.current = window.setTimeout(() => {
        // Check if component is still mounted before attempting reconnection
        if (isMountedRef.current && !connectionRef.current.isConnecting && !connectionRef.current.activeConnection) {
          connectSSE();
        }
      }, reconnectDelay);
    }
  }, [connectSSE, toast]);
  
  // Initialize connection
  useEffect(() => {
    // Only connect if authenticated
    if (isAuthenticated) {
      connectSSE();
    } else {
      setLoading(false);
    }
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      abortCurrentConnection();
    };
  }, [isAuthenticated, connectSSE, abortCurrentConnection]);
  
  return { count, loading, error };
};

