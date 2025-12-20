import { createEventSourceWithHeaders, canUseEventSourceWithHeaders } from './eventSourceWithHeaders';

export interface HumanNeededSubscriptionOptions {
  token?: string;
  assistantId?: string;
  onMessage: (eventType: string, data: string) => void;
  onError?: (error: Event) => void;
  /** Función para obtener un nuevo token cuando el actual expire */
  refreshToken?: () => Promise<string>;
}

export interface HumanNeededSubscription {
  close: () => void;
  source: EventSource;
}

// Configuración de reconexión con backoff exponencial
const INITIAL_RETRY_DELAY = 1000; // 1 segundo
const MAX_RETRY_DELAY = 60000; // 1 minuto máximo
const MAX_RETRIES = 10;

/**
 * Crea una suscripción SSE con reconexión automática y renovación de token.
 *
 * Cuando hay un error de conexión (incluyendo 401 por token expirado):
 * 1. Cierra la conexión actual
 * 2. Obtiene un nuevo token si refreshToken está disponible
 * 3. Reconecta con backoff exponencial
 * 4. Se detiene después de MAX_RETRIES intentos fallidos
 */
export function subscribeToHumanNeeded({
  token,
  assistantId,
  onMessage,
  onError,
  refreshToken
}: HumanNeededSubscriptionOptions): HumanNeededSubscription {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.condamind.com';

  let currentSource: EventSource | null = null;
  let currentToken = token;
  let retryCount = 0;
  let retryDelay = INITIAL_RETRY_DELAY;
  let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let isClosed = false;

  const buildUrl = () => {
    const url = new URL(`${baseUrl}/notifications/sse/human-needed`);
    if (assistantId) {
      url.searchParams.set('assistant_id', assistantId);
    }
    if (currentToken) {
      url.searchParams.set('auth_type', 'bearer');
    }
    return url.toString();
  };

  const createConnection = () => {
    if (isClosed) return;

    // Crear EventSource con el token actual
    if (currentToken && canUseEventSourceWithHeaders()) {
      currentSource = createEventSourceWithHeaders(buildUrl(), {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
    } else {
      currentSource = new EventSource(buildUrl());
    }

    const handler = (ev: MessageEvent) => {
      // Conexión exitosa - resetear contadores de retry
      retryCount = 0;
      retryDelay = INITIAL_RETRY_DELAY;
      onMessage(ev.type, ev.data);
    };

    currentSource.addEventListener('initial', handler);
    currentSource.addEventListener('update', handler);
    currentSource.addEventListener('ping', () => {
      // Ping recibido - conexión activa, resetear contadores
      retryCount = 0;
      retryDelay = INITIAL_RETRY_DELAY;
    });

    currentSource.addEventListener('error', async (event) => {
      if (isClosed) return;

      // Cerrar la conexión actual
      currentSource?.close();
      currentSource = null;

      // Verificar si debemos reintentar
      if (retryCount >= MAX_RETRIES) {
        console.error('[SSE] Max retries reached, stopping reconnection attempts');
        onError?.(event);
        return;
      }

      retryCount++;
      console.log(`[SSE] Connection error, attempt ${retryCount}/${MAX_RETRIES}. Retrying in ${retryDelay}ms`);

      // Intentar renovar el token si hay función de refresh
      if (refreshToken) {
        try {
          console.log('[SSE] Refreshing token before reconnect...');
          currentToken = await refreshToken();
          console.log('[SSE] Token refreshed successfully');
        } catch (refreshError) {
          console.error('[SSE] Failed to refresh token:', refreshError);
          // Continuar con el token actual, quizás el error no era de auth
        }
      }

      // Reconectar con backoff exponencial
      retryTimeoutId = setTimeout(() => {
        createConnection();
      }, retryDelay);

      // Aumentar el delay para el próximo intento (backoff exponencial)
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
    });
  };

  // Iniciar la primera conexión
  createConnection();

  return {
    get source() {
      return currentSource as EventSource;
    },
    close: () => {
      isClosed = true;
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
      }
      currentSource?.close();
      currentSource = null;
    }
  };
}
