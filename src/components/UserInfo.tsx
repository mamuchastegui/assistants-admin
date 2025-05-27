
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const UserInfo: React.FC = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const getOrgId = async () => {
      try {
        const token = await getAccessTokenSilently();
        // Parse the JWT token to get the org_id claim
        const payload = JSON.parse(atob(token.split('.')[1]));
        const orgId = payload['org_id'] || payload['https://condamind.com/tenant_id'] || 'Not available';
        setOrganizationId(orgId);
      } catch (error) {
        console.error('Error getting access token or organization ID:', error);
        setOrganizationId('Error retrieving organization ID');
      }
    };

    if (isAuthenticated) {
      getOrgId();
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">Name:</span>
          <span className="text-base">{user.name}</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">Email:</span>
          <span className="text-base">{user.email}</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">Organization ID:</span>
          <span className="text-base">{organizationId}</span>
        </div>
      </CardContent>
    </Card>
  );
};
