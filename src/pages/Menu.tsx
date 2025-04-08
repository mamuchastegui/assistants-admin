
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MenuManagement from "@/components/menu/MenuManagement";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

const Menu = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Gestión del Menú"
            description="Administre las opciones de menú disponibles para el sistema"
          />
          <Link to="/restaurant-menu">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Ver Menú</span>
            </Button>
          </Link>
        </div>

        <MenuManagement />
      </div>
    </DashboardLayout>
  );
};

export default Menu;
