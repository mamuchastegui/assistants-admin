import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Signup = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/');
      return;
    }

    const initiateSignup = async () => {
      try {
        await loginWithRedirect({
          authorizationParams: {
            screen_hint: 'signup'
          }
        });
      } catch (err) {
        console.error('Signup redirect error:', err);
        setError('Ocurrio un error al iniciar el registro.');
      }
    };

    if (!isLoading && !isAuthenticated) {
      initiateSignup();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, navigate]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Error de Registro</h1>
          <p className="text-muted-foreground">{error}</p>
          <Link to="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <h1 className="text-xl font-semibold">Redirigiendo al registro...</h1>
        <p className="text-muted-foreground">
          Por favor espera mientras te llevamos al formulario de registro.
        </p>
      </div>
    </div>
  );
};

export default Signup;
