import { useAuth0 } from '@auth0/auth0-react';
import { useDevAuth } from '@/devAuth/DevAuthProvider';

const shouldBypass =
  import.meta.env.DEV &&
  import.meta.env.VITE_SKIP_AUTH === 'true' &&
  (typeof window === 'undefined' ? false :
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

export const useAuth = () => {
  return shouldBypass ? useDevAuth() : useAuth0();
};
