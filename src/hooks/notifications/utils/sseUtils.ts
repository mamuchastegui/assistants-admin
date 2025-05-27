import { ConnectionRef } from '../types/sseTypes';

/**
 * Processes SSE events from a stream.
 */
export async function processEvents(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  onMessage: (eventType: string, data: string) => void,
  connectionRef: React.MutableRefObject<ConnectionRef>,
  isMountedRef: React.MutableRefObject<boolean>,
  onConnectionStateChange?: (isConnected: boolean) => void,
  scheduleReconnect?: (err: unknown) => void
) {
  // Buffer used to accumulate partial events between reads
  let pendingBuffer = '';

  const readLoop = async (): Promise<void> => {
    if (!isMountedRef.current || !connectionRef.current.activeConnection) return;

    try {
      const { value, done } = await reader.read();

      // Abort if component unmounted or connection lost in-between the read
      if (!isMountedRef.current || !connectionRef.current.activeConnection) return;

      if (done) {
        console.log('SSE stream closed normally');
        connectionRef.current.isConnecting = false;
        connectionRef.current.activeConnection = false;

        onConnectionStateChange?.(false);
        if (isMountedRef.current) scheduleReconnect?.(new Error('Stream closed normally'));
        return;
      }

      // Decode chunk and split into complete events
      pendingBuffer += decoder.decode(value, { stream: true });

      const parts = pendingBuffer.split('\n\n');
      pendingBuffer = parts.pop() ?? '';

      for (const part of parts) {
        if (part.trim() === '') continue;

        try {
          const eventMatch = part.match(/^event:\s*(.+)$/m);
          const dataMatch = part.match(/^data:\s*(.+)$/m);

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

      // Continue reading while mounted and connected
      if (isMountedRef.current && connectionRef.current.activeConnection) {
        await readLoop();
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;

      if (err.name === 'AbortError') {
        console.log('SSE connection aborted intentionally');
        return;
      }

      console.error('Error reading SSE stream:', err);
      connectionRef.current.activeConnection = false;

      onConnectionStateChange?.(false);
      scheduleReconnect?.(err);
    }
  };

  await readLoop();
}
