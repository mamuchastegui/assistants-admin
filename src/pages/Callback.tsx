
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle authentication errors
    if (error) {
      console.error("Auth0 error:", error);
      navigate(`/auth-error?message=${encodeURIComponent(error.message)}`);
    } 
    // If authentication is complete and user is authenticated, redirect to home
    else if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate, error]);

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
