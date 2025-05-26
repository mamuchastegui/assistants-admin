
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    toast.success("Has cerrado sesión correctamente");
    logout({ 
      logoutParams: {
        returnTo: 'https://admin.condamind.com/'
      },
      openUrl: false
    });
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant="outline"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </Button>
  );
};
