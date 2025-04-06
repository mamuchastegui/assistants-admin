
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MenuManagement from "@/components/menu/MenuManagement";
import { PageHeader } from "@/components/ui/page-header";

const Menu = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <PageHeader
          title="Gestión del Menú"
          description="Administre las opciones de menú disponibles para el sistema"
        />

        <MenuManagement />
      </div>
    </DashboardLayout>
  );
};

export default Menu;
