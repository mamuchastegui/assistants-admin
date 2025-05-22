
import { useCallback, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ConnectionRef, UseSSEConnectionProps, SSEConnectionResult } from './types/sseTypes';
import { processEvents } from './utils/sseUtils';

export const useSSEConnection = ({
  endpoint,
  onMessage,
  onError,
  onConnectionStateChange
}: UseSSEConnectionProps): SSEConnectionResult => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  
  // Reference to track active connection
  const connectionRef = useRef<ConnectionRef>({ 
    controller: null, 
    isConnecting: false, 
    reconnectAttempts: 0,
    activeConnection: false
  });
  
  // Reference to track retry timing
  const retryTimerRef = useRef<number | null>(null);
  
  // Flag to track if component is mounted
  const isMountedRef = useRef<boolean>(true);
  
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
    
    if (onConnectionStateChange) {
      onConnectionStateChange(false);
    }
  }, [onConnectionStateChange]);
  
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
  }, []);
  
  // Function to establish SSE connection
  const connectSSE = useCallback(async () => {
    // Don't attempt to connect if component is unmounted
    if (!isMountedRef.current) {
      return;
    }
    
    // Avoid multiple simultaneous connection attempts
    if (connectionRef.current.isConnecting || !isAuthenticated) {
      return;
    }
    
    // Only abort existing connection if we're not already connected
    if (!connectionRef.current.activeConnection) {
      // Abort any existing connection
      abortCurrentConnection();
    } else {
      // If we already have an active connection, don't create a new one
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
        processEvents(
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
  }, [isAuthenticated, getAccessTokenSilently, endpoint, onMessage, onError, onConnectionStateChange, abortCurrentConnection, scheduleReconnect]);
  
  // Initialize connection
  useEffect(() => {
    // Only connect if authenticated
    if (isAuthenticated) {
      connectSSE();
    }
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      abortCurrentConnection();
    };
  }, [isAuthenticated, connectSSE, abortCurrentConnection]);
  
  return {
    abortConnection: abortCurrentConnection,
    reconnect: connectSSE,
    isConnecting: connectionRef.current.isConnecting,
    isConnected: connectionRef.current.activeConnection
  };
};
