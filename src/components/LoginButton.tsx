
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';

export const LoginButton: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const orgId = import.meta.env.VITE_AUTH0_ORG_ID;

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        organization: orgId,
      }
    });
  };

  return (
    <Button 
      onClick={handleLogin} 
      variant="default"
      className="flex items-center gap-2"
    >
      Login
    </Button>
  );
};
