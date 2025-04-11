
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import CreateOrderModal from "@/components/orders/CreateOrderModal";
import OrderDashboardCards from "@/components/orders/OrderDashboardCards";
import OrderTable from "@/components/orders/OrderTable";
import { useOrders } from "@/hooks/useOrders";

const Orders = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { 
    orders, 
    isLoading, 
    isError, 
    updatePaymentMethod,
    updateOrderStatus
  } = useOrders();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          title="Pedidos de Catering"
          actions={
            <Button onClick={() => setCreateModalOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Pedido</span>
            </Button>
          }
        />
        
        <OrderDashboardCards 
          orders={orders} 
          isLoading={isLoading} 
        />
        
        <OrderTable 
          orders={orders}
          isLoading={isLoading}
          isError={isError}
          onPaymentMethodChange={updatePaymentMethod}
          onOrderStatusChange={updateOrderStatus}
        />
      </div>
      
      <CreateOrderModal 
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </DashboardLayout>
  );
};

export default Orders;
