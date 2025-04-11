
import React from "react";
import { format } from "date-fns";
import { CreditCard } from "lucide-react";
import OrderStatsCard from "./OrderStatsCard";
import { Order } from "@/types/order";

interface OrderDashboardCardsProps {
  orders?: Order[];
  isLoading: boolean;
}

const OrderDashboardCards = ({ orders, isLoading }: OrderDashboardCardsProps) => {
  // Helper functions
  const countOrders = (status?: string) => {
    if (!orders) return 0;
    
    if (!status) {
      return orders.length;
    }
    
    return orders.filter(order => order.status === status).length;
  };

  const calculateTotalRevenue = () => {
    if (!orders) return 0;
    return orders.reduce((total, order) => total + (order.number_of_people * 12000), 0);
  };

  const calculateTotalPeople = () => {
    if (!orders) return 0;
    return orders.reduce((total, order) => total + order.number_of_people, 0);
  };

  const countOrdersToday = () => {
    if (!orders) return 0;
    
    return orders.filter(order => 
      formatDate(order.created_at).startsWith(format(new Date(), "dd/MM/yyyy"))
    ).length;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  const countPendingPayments = () => {
    if (!orders) return 0;
    
    return orders.filter(order => 
      order.payment_status === 'pending' || !order.payment_status
    ).length;
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <OrderStatsCard 
        title="Total de Pedidos" 
        value={countOrders()}
        description={`${countOrders('pending')} pendientes`}
        isLoading={isLoading}
      />
      
      <OrderStatsCard 
        title="Pedidos Hoy" 
        value={countOrdersToday()}
        description="Pedidos del día"
        isLoading={isLoading}
      />
      
      <OrderStatsCard 
        title="Pagos Pendientes" 
        value={countPendingPayments()}
        description={
          <>
            <CreditCard className="h-3 w-3 inline mr-1" />
            Pagos por confirmar
          </>
        }
        isLoading={isLoading}
      />
      
      <OrderStatsCard 
        title="Ingreso Estimado" 
        value={`$${calculateTotalRevenue().toLocaleString()}`}
        description={`Basado en ${calculateTotalPeople()} personas`}
        isLoading={isLoading}
      />
    </div>
  );
};

export default OrderDashboardCards;
