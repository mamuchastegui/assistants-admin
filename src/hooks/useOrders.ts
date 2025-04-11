
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Order } from "@/types/order";

interface OrdersResponse {
  response: Order[];
}

const fetchOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching orders...');
    const response = await fetch('https://api.condamind.com/v1/catering/orders', {
      headers: {
        'Content-Type': 'application/json',
        'assistant-id': 'asst_OS4bPZIMBpvpYo2GMkG0ast5'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al cargar los pedidos: ${response.status}`);
    }
    
    const data: OrdersResponse = await response.json();
    console.log('Orders fetched successfully:', data.response);
    return data.response;
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("No se pudieron cargar los pedidos");
    throw error;
  }
};

export const useOrders = () => {
  const { data: orders, isLoading, error, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const [ordersState, setOrders] = useState<Order[] | undefined>(orders);

  useEffect(() => {
    if (orders) {
      setOrders(orders);
      console.log('Orders state updated:', orders);
    }
  }, [orders]);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = ordersState?.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    toast.success(`Estado del pedido ${orderId} actualizado a: ${newStatus}`);
  };

  return {
    orders: ordersState,
    isLoading,
    isError,
    error,
    updateOrderStatus
  };
};
