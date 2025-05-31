import { createEventSourceWithHeaders } from './eventSourceWithHeaders.js';

export function subscribeToHumanNeeded({ token, assistantId, onMessage, onError }) {
  const baseUrl = import.meta.env?.VITE_API_URL || 'https://api.condamind.com';
  const url = new URL(`${baseUrl}/notifications/sse/human-needed`);
  if (assistantId) {
    url.searchParams.set('assistant_id', assistantId);
  }
  
  // Definimos el handler para los eventos
  const handler = ev => {
    onMessage(ev.type, ev.data);
  };
  
  let source;
  
  // Si tenemos token y podemos usar EventSourceWithHeaders, lo usamos para enviar el token como header
  if (token) {
    source = createEventSourceWithHeaders(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } else {
    source = new EventSource(url.toString());
  }
  
  // Configurar los event listeners
  source.addEventListener('initial', handler);
  source.addEventListener('update', handler);
  
  if (onError) {
    source.addEventListener('error', onError);
  }
  
  return {
    source,
    close: () => source.close()
  };
}
