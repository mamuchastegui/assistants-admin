
import { useAuth0 } from "@auth0/auth0-react";
import { ConnectionRef } from '../types/sseTypes';

/**
 * Establishes an SSE connection with authentication
 */
export async function establishSSEConnection(
  endpoint: string,
  isMountedRef: React.MutableRefObject<boolean>,
  connectionRef: React.MutableRefObject<ConnectionRef>,
  getAccessTokenSilently: ReturnType<typeof useAuth0>['getAccessTokenSilently'],
  onConnectionStateChange: ((isConnected: boolean) => void) | undefined,
  processEventsCallback: (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder,
    onMessage: (eventType: string, data: string) => void,
    connectionRef: React.MutableRefObject<ConnectionRef>,
    isMountedRef: React.MutableRefObject<boolean>,
    onConnectionStateChange: ((isConnected: boolean) => void) | undefined,
    scheduleReconnect: ((err: any) => void) | undefined
  ) => void,
  onMessage: (eventType: string, data: string) => void,
  scheduleReconnect: (err: any) => void,
  onError?: (error: Error) => void
) {
  // Don't attempt to connect if component is unmounted
  if (!isMountedRef.current) {
    return;
  }
  
  // Mark as connecting to prevent multiple parallel connections
  connectionRef.current.isConnecting = true;
  
  try {
    console.log('Establishing SSE connection...');
    const token = await getAccessTokenSilently();
    const baseUrl = import.meta.env.VITE_API_URL || "https://api.condamind.com";
    
    // Create a new AbortController for this connection
    const controller = new AbortController();
    connectionRef.current.controller = controller;
    
    // Create URL for SSE connection
    const url = `${baseUrl}${endpoint}`;
    
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
      abortConnection(connectionRef, onConnectionStateChange);
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
    connectionRef.current.isConnecting = false;
    connectionRef.current.activeConnection = true;
    connectionRef.current.reconnectAttempts = 0; // Reset attempt counter on success
    
    if (onConnectionStateChange) {
      onConnectionStateChange(true);
    }
    
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    
    // Start processing events
    if (isMountedRef.current) {
      processEventsCallback(
        reader, 
        decoder, 
        onMessage, 
        connectionRef, 
        isMountedRef, 
        onConnectionStateChange,
        scheduleReconnect
      );
    }
    
  } catch (err: any) {
    // Don't proceed if component is unmounted
    if (!isMountedRef.current) return;
    
    console.error('Failed to establish SSE connection:', err);
    connectionRef.current.activeConnection = false;
    connectionRef.current.isConnecting = false;
    
    if (onError) {
      onError(err instanceof Error ? err : new Error('Unknown error connecting to notifications service'));
    }
    
    if (onConnectionStateChange) {
      onConnectionStateChange(false);
    }
    
    // Only schedule reconnect if not aborted intentionally
    if (err.name !== 'AbortError') {
      scheduleReconnect(err);
    }
  }
}

/**
 * Aborts the current connection and cleans up resources
 */
export function abortConnection(
  connectionRef: React.MutableRefObject<ConnectionRef>,
  onConnectionStateChange?: (isConnected: boolean) => void
): void {
  if (connectionRef.current.controller) {
    connectionRef.current.controller.abort();
    connectionRef.current.controller = null;
  }
  
  connectionRef.current.isConnecting = false;
  connectionRef.current.activeConnection = false;
  
  if (onConnectionStateChange) {
    onConnectionStateChange(false);
  }
}

/**
 * Creates a function to schedule reconnection with fixed delay
 */
export function createReconnectScheduler(
  isMountedRef: React.MutableRefObject<boolean>,
  connectionRef: React.MutableRefObject<ConnectionRef>,
  retryTimerRef: React.MutableRefObject<number | null>,
  connectSSE: () => void,
  onConnectionStateChange?: (isConnected: boolean) => void,
  onError?: (error: Error) => void
) {
  return (err: any) => {
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
      if (onError) {
        onError(new Error('Authentication error. Please log in again.'));
      }
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
  };
}

/**
 * Cleans up any active connection and timers
 */
export function cleanupConnection(
  isMountedRef: React.MutableRefObject<boolean>,
  connectionRef: React.MutableRefObject<ConnectionRef>,
  retryTimerRef: React.MutableRefObject<number | null>,
  onConnectionStateChange?: (isConnected: boolean) => void
): void {
  isMountedRef.current = false;
  
  if (connectionRef.current.controller) {
    connectionRef.current.controller.abort();
    connectionRef.current.controller = null;
  }
  
  if (retryTimerRef.current !== null) {
    window.clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  }
  
  connectionRef.current.isConnecting = false;
  connectionRef.current.activeConnection = false;
  
  if (onConnectionStateChange) {
    onConnectionStateChange(false);
  }
}
