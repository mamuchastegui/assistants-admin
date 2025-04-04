
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MenuManagement from "@/components/menu/MenuManagement";
import StatsCategories from "@/components/stats/StatsCategories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";

const Menu = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <PageHeader
          title="Gestión del Menú y Categorías"
          description="Administre las opciones de menú y categorías estadísticas disponibles para el sistema"
        />

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="menu">Opciones de Menú</TabsTrigger>
            <TabsTrigger value="stats">Categorías Estadísticas</TabsTrigger>
          </TabsList>
          <TabsContent value="menu">
            <MenuManagement />
          </TabsContent>
          <TabsContent value="stats">
            <StatsCategories />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Menu;
