import { createRequire } from 'module';
let EventSourcePolyfill;
try {
  const require = createRequire(import.meta.url);
  ({ EventSourcePolyfill } = require('event-source-polyfill'));
} catch (err) {
  EventSourcePolyfill = undefined;
}

export function canUseEventSourceWithHeaders() {
  return typeof EventSourcePolyfill !== 'undefined';
}

export function createEventSourceWithHeaders(url, options = {}) {
  if (canUseEventSourceWithHeaders()) {
    return new EventSourcePolyfill(url, options);
  }
  return new EventSource(url);
}
