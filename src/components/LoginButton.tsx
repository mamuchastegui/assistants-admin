
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/context/TenantContext';

export const LoginButton: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const { orgId } = useTenant();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: orgId ? { organization: orgId } : {}
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
