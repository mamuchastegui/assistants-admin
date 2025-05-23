
import { ConnectionRef } from '../types/sseTypes';
import { abortConnection } from './connectionManagement';

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
