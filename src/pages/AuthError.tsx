
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const AuthError = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'Unknown authentication error';

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p className="break-words">{message}</p>
        </div>
        <p className="text-muted-foreground mb-6">
          You might not have access to this organization or there was an issue with your credentials.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link to="/auth">Try Again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
