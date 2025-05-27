
import React, { ReactNode } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/context/TenantContext';
import { DevAuthProvider } from '@/devAuth/DevAuthProvider';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { orgId } = useTenant();

  const shouldBypass =
    import.meta.env.DEV &&
    import.meta.env.VITE_SKIP_AUTH === 'true' &&
    (typeof window === 'undefined'
      ? false
      : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (shouldBypass) {
    return <DevAuthProvider>{children}</DevAuthProvider>;
  }

  // Auth0 configuration from environment variables
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE || '';
  const callbackUrl = import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin + '/callback';

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  if (!domain || !clientId || !audience) {
    console.error('Missing Auth0 configuration. Please check your environment variables.');
    return <div>Auth0 configuration is missing. Please check your environment variables.</div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: callbackUrl,
        audience: audience,
        ...(orgId ? { organization: orgId } : {}),
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
