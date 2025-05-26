
import { useAuth } from "@/hooks/useAuth";
import { ConnectionRef } from '../types/sseTypes';

/**
 * Establishes an SSE connection with authentication
 */
export async function establishSSEConnection(
  endpoint: string,
  isMountedRef: React.MutableRefObject<boolean>,
  connectionRef: React.MutableRefObject<ConnectionRef>,
  getAccessTokenSilently: ReturnType<typeof useAuth>['getAccessTokenSilently'],
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

// Import from the new management file
import { abortConnection } from './connectionManagement';
