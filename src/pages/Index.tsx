
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LandingPage } from "@/components/landing/LandingPage";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full px-6 py-8 space-y-8 rounded-lg shadow-lg bg-card">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bienvenido a Condamind</h1>
          <p className="text-muted-foreground mt-2">Gestiona tu negocio de forma eficiente</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link to="/calendar">
              <Button className="w-full" variant="outline">Calendario</Button>
            </Link>
            <Link to="/orders">
              <Button className="w-full" variant="outline">Pedidos</Button>
            </Link>
            <Link to="/menu">
              <Button className="w-full" variant="outline">Menu</Button>
            </Link>
            <Link to="/products">
              <Button className="w-full" variant="outline">Productos</Button>
            </Link>
            <Link to="/assistant">
              <Button className="w-full" variant="outline">Asistente</Button>
            </Link>
            <Link to="/auth" className="sm:col-span-2">
              <Button className="w-full" variant="default">Mi Perfil</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
