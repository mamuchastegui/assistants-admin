
import { ConnectionRef } from '../types/sseTypes';

/**
 * Processes SSE events from a stream
 */
export async function processEvents(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  onMessage: (eventType: string, data: string) => void,
  connectionRef: React.MutableRefObject<ConnectionRef>,
  isMountedRef: React.MutableRefObject<boolean>,
  onConnectionStateChange?: (isConnected: boolean) => void,
  scheduleReconnect?: (err: any) => void
) {
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
      
      if (onConnectionStateChange) {
        onConnectionStateChange(false);
      }
      
      // Schedule reconnect for normal closures
      if (isMountedRef.current && scheduleReconnect) {
        scheduleReconnect(new Error('Stream closed normally'));
      }
      return;
    }
    
    let buffer = decoder.decode(value, { stream: true });
    
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
          onMessage(eventType, data);
        }
      } catch (err) {
        console.error('Error processing SSE data:', err);
      }
    }
    
    // Continue reading only if component is still mounted and connection is active
    if (isMountedRef.current && connectionRef.current.activeConnection) {
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
    
    if (err.name === 'AbortError') {
      console.log('SSE connection aborted intentionally');
      return;
    }
    
    console.error('Error reading SSE stream:', err);
    connectionRef.current.activeConnection = false;
    
    if (onConnectionStateChange) {
      onConnectionStateChange(false);
    }
    
    if (scheduleReconnect) {
      scheduleReconnect(err);
    }
  }
}
