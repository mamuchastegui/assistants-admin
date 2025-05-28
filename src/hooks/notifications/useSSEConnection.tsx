
import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ConnectionRef, UseSSEConnectionProps, SSEConnectionResult } from './types/sseTypes';
import { processEvents } from './utils/sseUtils';
import { 
  establishSSEConnection, 
  abortConnection, 
  createReconnectScheduler, 
  cleanupConnection 
} from './utils/connectionUtils';

export const useSSEConnection = ({
  endpoint,
  queryParams,
  onMessage,
  onError,
  onConnectionStateChange
}: UseSSEConnectionProps): SSEConnectionResult => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth();
  
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
    // Clear any pending retry timer
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    
    abortConnection(connectionRef, onConnectionStateChange);
  }, [onConnectionStateChange]);
  
  // Create reconnect scheduler
  const scheduleReconnect = useCallback(
    createReconnectScheduler(
      isMountedRef,
      connectionRef,
      retryTimerRef,
      () => connectSSE(),
      onConnectionStateChange,
      onError
    ),
    [onConnectionStateChange, onError]
  );
  
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
    
    await establishSSEConnection(
      endpoint,
      queryParams,
      isMountedRef,
      connectionRef,
      getAccessTokenSilently,
      onConnectionStateChange,
      processEvents,
      onMessage,
      scheduleReconnect,
      onError
    );
  }, [
    isAuthenticated,
    getAccessTokenSilently,
    endpoint,
    queryParams,
    onMessage,
    onError,
    onConnectionStateChange,
    abortCurrentConnection,
    scheduleReconnect
  ]);
  
  // Initialize connection
  useEffect(() => {
    // Only connect if authenticated
    if (isAuthenticated) {
      connectSSE();
    }
    
    // Clean up on unmount
    return () => {
      cleanupConnection(isMountedRef, connectionRef, retryTimerRef, onConnectionStateChange);
    };
  }, [isAuthenticated, connectSSE, onConnectionStateChange]);
  
  return {
    abortConnection: abortCurrentConnection,
    reconnect: connectSSE,
    isConnecting: connectionRef.current.isConnecting,
    isConnected: connectionRef.current.activeConnection
  };
};
