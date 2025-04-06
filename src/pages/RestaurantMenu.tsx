
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RestaurantMenu from "@/components/restaurant/RestaurantMenu";
import { PageHeader } from "@/components/ui/page-header";

const RestaurantMenuPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <PageHeader
          title="Menú del Restaurante"
          description="Explore nuestra selección de platos preparados con ingredientes frescos y de temporada"
        />

        <div className="mt-8">
          <RestaurantMenu />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RestaurantMenuPage;
