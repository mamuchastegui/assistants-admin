
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button, ButtonProps } from '@/components/ui/button';
import { useTenant } from '@/context/TenantContext';

interface LoginButtonProps extends Omit<ButtonProps, 'onClick'> {
  children?: React.ReactNode;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  children = 'Iniciar Sesion',
  variant = 'default',
  ...props
}) => {
  const { loginWithRedirect } = useAuth();
  const { orgId } = useTenant();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: orgId ? { organization: orgId } : {}
    });
  };

  return (
    <Button
      onClick={handleLogin}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
};
