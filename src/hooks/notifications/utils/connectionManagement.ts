
import { ConnectionRef } from '../types/sseTypes';

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
