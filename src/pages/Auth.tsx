
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LoginButton } from '@/components/LoginButton';
import { LogoutButton } from '@/components/LogoutButton';
import { UserInfo } from '@/components/UserInfo';
import DashboardLayout from "@/components/layout/DashboardLayout";

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 h-full max-h-screen overflow-y-auto p-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Authentication</h1>
          <p className="text-sm text-muted-foreground">
            Manage your authentication settings and view user information.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="flex justify-center md:justify-start">
            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
          </div>
          
          {isAuthenticated && <UserInfo />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Auth;
