
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_COMPLETED_KEY = 'condamind_onboarding_completed';

const Callback = () => {
  const authContext = useAuth();
  const navigate = useNavigate();

  // Type guard to check if we have Auth0 context with error
  const isAuth0Context = (ctx: any): ctx is { error?: Error; isAuthenticated: boolean; isLoading: boolean; user?: { sub?: string } } => {
    return ctx && 'error' in ctx;
  };

  useEffect(() => {
    // Handle authentication errors (only for Auth0)
    if (isAuth0Context(authContext) && authContext.error) {
      console.error("Auth0 error:", authContext.error);
      navigate(`/auth-error?message=${encodeURIComponent(authContext.error.message)}`);
    }
    // If authentication is complete and user is authenticated, check onboarding
    else if (!authContext.isLoading && authContext.isAuthenticated) {
      const userId = authContext.user?.sub;
      if (userId) {
        const onboardingKey = `${ONBOARDING_COMPLETED_KEY}_${userId}`;
        const hasCompletedOnboarding = localStorage.getItem(onboardingKey);

        if (!hasCompletedOnboarding) {
          navigate('/onboarding');
          return;
        }
      }
      navigate('/');
    }
  }, [authContext.isLoading, authContext.isAuthenticated, authContext.user, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold">Finalizando inicio de sesion...</h1>
        <p className="text-muted-foreground">Por favor espera mientras completamos el proceso.</p>
      </div>
    </div>
  );
};

export default Callback;
