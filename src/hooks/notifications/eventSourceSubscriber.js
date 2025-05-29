export function subscribeToHumanNeeded({ token, assistantId, onMessage, onError }) {
  const baseUrl = import.meta.env?.VITE_API_URL || 'https://api.condamind.com';
  const url = new URL(`${baseUrl}/notifications/sse/human-needed`);
  if (assistantId) {
    url.searchParams.set('assistant_id', assistantId);
  }
  if (token) {
    url.searchParams.set('token', token);
  }
  const source = new EventSource(url.toString());
  const handler = ev => {
    onMessage(ev.type, ev.data);
  };
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
