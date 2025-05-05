
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AlertCircle } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

const Login = () => {
  const [searchParams] = useSearchParams();
  const { loginWithRedirect } = useAuth0();
  const { setOrgId } = useTenant();
  const [error, setError] = useState<string | null>(null);

  const invitation = searchParams.get('invitation');
  const organization = searchParams.get('organization');
  const organizationName = searchParams.get('organization_name');

  useEffect(() => {
    const handleInvitationLogin = async () => {
      if (organization) {
        // Save the organization ID for the session
        setOrgId(organization);
      }
      
      if (invitation && organization) {
        try {
          console.log('Initiating invitation login flow with:', { invitation, organization });
          await loginWithRedirect({
            authorizationParams: {
              invitation,
              organization,
            }
          });
        } catch (err) {
          console.error('Login redirect error:', err);
          setError('An error occurred while processing the invitation.');
        }
      } else {
        setError('Invalid or missing invitation parameters.');
      }
    };

    handleInvitationLogin();
  }, [invitation, organization, loginWithRedirect, setOrgId]);

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg text-center">
        {error ? (
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Invitation Error</h1>
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <p>{error}</p>
            </div>
            <p className="text-muted-foreground mt-4">
              Please contact your organization administrator for a new invitation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h1 className="text-xl font-semibold">Redirecting to login...</h1>
            {organizationName && (
              <p className="text-muted-foreground">
                Accepting invitation to join <span className="font-medium">{organizationName}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
