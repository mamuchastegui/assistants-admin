import { createEventSourceWithHeaders, canUseEventSourceWithHeaders } from './eventSourceWithHeaders';

export interface HumanNeededSubscriptionOptions {
  token?: string;
  assistantId?: string;
  onMessage: (eventType: string, data: string) => void;
  onError?: (error: Event) => void;
}

export interface HumanNeededSubscription {
  close: () => void;
  source: EventSource;
}

export function subscribeToHumanNeeded({ token, assistantId, onMessage, onError }: HumanNeededSubscriptionOptions): HumanNeededSubscription {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.condamind.com';
  const url = new URL(`${baseUrl}/notifications/sse/human-needed`);
  if (assistantId) {
    url.searchParams.set('assistant_id', assistantId);
  }
  
  // EventSource no permite configurar headers nativamente, por lo que usamos un enfoque alternativo
  // Si el token está presente, usamos una URL especial para indicar al servidor que debe verificar 
  // el token de Authorization en las cabeceras de la solicitud
  if (token) {
    url.searchParams.set('auth_type', 'bearer');
  }

  // Definimos el handler para los eventos
  const handler = (ev: MessageEvent) => {
    onMessage(ev.type, ev.data);
  };
  
  let source: EventSource;
  
  // Si tenemos token y podemos usar EventSourceWithHeaders, lo usamos para enviar el token como header
  if (token && canUseEventSourceWithHeaders()) {
    source = createEventSourceWithHeaders(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } else {
    // Fallback a EventSource estándar - si hay token, el backend debe soportar la obtención del token de otra manera
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
