
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const UserInfo: React.FC = () => {
  const authContext = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Type guard to check if we have Auth0 context
  const isAuth0Context = (ctx: any): ctx is { user: any; getAccessTokenSilently: () => Promise<string>; isAuthenticated: boolean } => {
    return ctx && typeof ctx.getAccessTokenSilently === 'function' && 'user' in ctx;
  };

  // Type guard to check if we have Dev Auth context
  const isDevAuthContext = (ctx: any): ctx is { token: string | null; isAuthenticated: boolean } => {
    return ctx && 'token' in ctx && !('user' in ctx);
  };

  useEffect(() => {
    const getOrgId = async () => {
      try {
        if (isAuth0Context(authContext)) {
          const token = await authContext.getAccessTokenSilently();
          // Parse the JWT token to get the org_id claim
          const payload = JSON.parse(atob(token.split('.')[1]));
          const orgId = payload['org_id'] || payload['https://condamind.com/tenant_id'] || 'Not available';
          setOrganizationId(orgId);
        }
      } catch (error) {
        console.error('Error getting access token or organization ID:', error);
        setOrganizationId('Error retrieving organization ID');
      }
    };

    if (authContext.isAuthenticated) {
      getOrgId();
    }
  }, [authContext]);

  if (!authContext.isAuthenticated) {
    return null;
  }

  // Get user data based on auth type
  const userData = isAuth0Context(authContext) ? authContext.user : null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">Name:</span>
          <span className="text-base">{userData?.name || 'Dev User'}</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">Email:</span>
          <span className="text-base">{userData?.email || 'dev@example.com'}</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">Organization ID:</span>
          <span className="text-base">{organizationId || 'Not available'}</span>
        </div>
      </CardContent>
    </Card>
  );
};
