
export interface ConnectionRef {
  controller: AbortController | null;
  isConnecting: boolean;
  reconnectAttempts: number;
  activeConnection: boolean;
}

export interface UseSSEConnectionProps {
  endpoint: string;
  onMessage: (eventType: string, data: string) => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (isConnected: boolean) => void;
}

export interface SSEConnectionResult {
  abortConnection: () => void;
  reconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
}
