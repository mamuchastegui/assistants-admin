import { EventSourcePolyfill } from 'event-source-polyfill';

export function createEventSourceWithHeaders(url, options = {}) {
  if (typeof globalThis.EventSourcePolyfill !== 'undefined') {
    return new globalThis.EventSourcePolyfill(url, options);
  }
  if (typeof EventSourcePolyfill !== 'undefined') {
    return new EventSourcePolyfill(url, options);
  }
  return new EventSource(url);
}
