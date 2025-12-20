import { EventSourcePolyfill } from 'event-source-polyfill';

// Tipo para las opciones de EventSource con headers
export interface EventSourceWithHeadersOptions {
  headers?: Record<string, string>;
  heartbeatTimeout?: number;
  [key: string]: any;
}

/**
 * Verifica si podemos usar EventSourcePolyfill
 */
export function canUseEventSourceWithHeaders(): boolean {
  return typeof EventSourcePolyfill !== 'undefined';
}

/**
 * Crea un EventSource con soporte para headers si está disponible,
 * o un EventSource estándar si no lo está.
 *
 * Configuración:
 * - heartbeatTimeout: 120s (el servidor envía pings cada 30s, damos margen amplio)
 */
export function createEventSourceWithHeaders(
  url: string,
  options: EventSourceWithHeadersOptions = {}
): EventSource {
  if (canUseEventSourceWithHeaders()) {
    return new EventSourcePolyfill(url, {
      ...options,
      // Timeout largo para evitar desconexiones innecesarias
      // El servidor envía pings cada 30 segundos
      heartbeatTimeout: options.heartbeatTimeout ?? 120000,
    }) as unknown as EventSource;
  }
  return new EventSource(url);
} 