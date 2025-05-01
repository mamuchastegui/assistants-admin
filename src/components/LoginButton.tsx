
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';

export const LoginButton: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        organization: 'org_ORM7JMUqLxcGbAqI', // Static organization ID as required
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
