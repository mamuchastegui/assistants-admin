import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonProps } from '@/components/ui/button';

interface SignupButtonProps extends Omit<ButtonProps, 'onClick'> {
  children?: React.ReactNode;
}

export const SignupButton: React.FC<SignupButtonProps> = ({
  children = 'Crear Cuenta',
  variant = 'default',
  ...props
}) => {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate('/signup')} variant={variant} {...props}>
      {children}
    </Button>
  );
};
