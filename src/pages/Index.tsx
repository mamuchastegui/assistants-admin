
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { LandingPage } from "@/components/landing/LandingPage";
import { useBusinessType } from "@/context/BusinessTypeContext";
import { getMenuItems } from "@/config/businessMenus";
import { Dumbbell, Hotel, Target, Settings } from "lucide-react";

const businessTypeLabels = {
  gym: { label: 'Gimnasio', icon: Dumbbell },
  hotel: { label: 'Hoteleria', icon: Hotel },
  habits: { label: 'Habitos', icon: Target },
};

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { businessType } = useBusinessType();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Get menu items based on business type (excluding 'inicio' since we're on it)
  const menuItems = getMenuItems(businessType).filter(item => item.id !== 'inicio');
  const BusinessIcon = businessType ? businessTypeLabels[businessType].icon : null;

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full px-6 py-8 space-y-8 rounded-lg shadow-lg bg-card">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bienvenido a Condamind</h1>
          <p className="text-muted-foreground mt-2">Gestiona tu negocio de forma eficiente</p>
          {businessType && (
            <Badge variant="secondary" className="mt-3">
              {BusinessIcon && <BusinessIcon className="h-3 w-3 mr-1" />}
              {businessTypeLabels[businessType].label}
            </Badge>
          )}
          {!businessType && (
            <p className="text-xs text-muted-foreground mt-3">
              Configura tu tipo de negocio en tu perfil para ver opciones personalizadas
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {menuItems.map((item) => (
              <Link key={item.id} to={item.path}>
                <Button className="w-full" variant="outline">
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Link to="/auth" className="sm:col-span-2">
              <Button className="w-full" variant="default">
                <Settings className="h-4 w-4 mr-2" />
                Mi Perfil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
