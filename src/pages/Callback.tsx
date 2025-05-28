
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const authContext = useAuth();
  const navigate = useNavigate();

  // Type guard to check if we have Auth0 context with error
  const isAuth0Context = (ctx: any): ctx is { error?: Error; isAuthenticated: boolean; isLoading: boolean } => {
    return ctx && 'error' in ctx;
  };

  useEffect(() => {
    // Handle authentication errors (only for Auth0)
    if (isAuth0Context(authContext) && authContext.error) {
      console.error("Auth0 error:", authContext.error);
      navigate(`/auth-error?message=${encodeURIComponent(authContext.error.message)}`);
    } 
    // If authentication is complete and user is authenticated, redirect to home
    else if (!authContext.isLoading && authContext.isAuthenticated) {
      navigate('/');
    }
  }, [authContext.isLoading, authContext.isAuthenticated, navigate]);

  // If user is already authenticated, this will not show as they will be redirected
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold">Finalizing login...</h1>
        <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
};

export default Callback;
