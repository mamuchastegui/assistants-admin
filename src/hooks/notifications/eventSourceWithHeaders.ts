import { EventSourcePolyfill } from 'event-source-polyfill';

// Tipo para las opciones de EventSource con headers
export interface EventSourceWithHeadersOptions {
  headers?: Record<string, string>;
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
 * o un EventSource estándar si no lo está
 */
export function createEventSourceWithHeaders(
  url: string, 
  options: EventSourceWithHeadersOptions = {}
): EventSource {
  if (canUseEventSourceWithHeaders()) {
    return new EventSourcePolyfill(url, options) as unknown as EventSource;
  }
  return new EventSource(url);
} 
