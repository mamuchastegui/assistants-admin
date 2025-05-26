
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useAuthApi = () => {
  const { getAccessTokenSilently } = useAuth();

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      try {
        const token = await getAccessTokenSilently();
        
        const headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('API request error:', error);
        throw error;
      }
    },
    [getAccessTokenSilently]
  );

  return { authFetch };
};
