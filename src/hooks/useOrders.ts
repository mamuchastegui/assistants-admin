
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Order, MenuType, PaymentMethod, OrderStatus } from "@/types/order";
import { supabase } from "@/lib/supabase";
import { translatePaymentMethod, translateOrderStatus } from "@/components/orders/utils/orderUtils";

interface OrdersResponse {
  response: Order[];
}

const fetchOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching orders...');
    // First, try to fetch from Supabase if it's available
    if (supabase) {
      const { data, error } = await supabase
        .from('catering_orders')
        .select(`
          *,
          dinner_group:dinner_group_id(*),
          payments:order_payments(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Ensure all orders have a status even if not set in database
      return data.map(order => ({
        ...order,
        status: order.status || 'pending',
        number_of_people: order.total_guests || 0
      })) as Order[];
    } else {
      // Fallback to the mock API with the new endpoint
      const response = await fetch('https://api.condamind.com/v1/catering/orders/summary', {
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
      
      // Map the new format to include backward compatibility fields
      return data.response.map(order => ({
        ...order,
        number_of_people: order.total_guests || 0,
        status: order.status as OrderStatus || 'pending'
      }));
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("No se pudieron cargar los pedidos");
    throw error;
  }
};

export const useOrders = () => {
  const queryClient = useQueryClient();
  const { data: orders, isLoading, error, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const [ordersState, setOrders] = useState<Order[] | undefined>(orders);

  useEffect(() => {
    if (orders) {
      setOrders(orders);
    }
  }, [orders]);

  const updatePaymentMethod = (orderId: string, newMethod: PaymentMethod) => {
    // Find the order to check payment method and status
    const order = ordersState?.find(o => o.id === orderId);
    
    // Validate business rules
    if (order?.payment_method === 'mercado_pago' && order.payment_status === 'paid') {
      toast.error("Los pedidos pagados por MercadoPago no pueden cambiar el método de pago");
      return;
    }
    
    // Optimistically update the UI
    const updatedOrders = ordersState?.map(order =>
      order.id === orderId ? { ...order, payment_method: newMethod } : order
    );
    setOrders(updatedOrders);
    
    // If Supabase is available, update the database
    if (supabase) {
      supabase
        .from('catering_orders')
        .update({ payment_method: newMethod })
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating payment method:", error);
            toast.error(`Error al actualizar el método de pago: ${error.message}`);
            // Revert to original state on error
            setOrders(orders);
          } else {
            toast.success(`Método de pago actualizado a: ${translatePaymentMethod(newMethod)}`);
            
            // Update any payments associated with this order
            supabase
              .from('order_payments')
              .update({ payment_method: newMethod })
              .eq('order_id', orderId);
            
            // Refresh orders data
            queryClient.invalidateQueries({ queryKey: ['orders'] });
          }
        });
    } else {
      // Mock success for demo
      toast.success(`Método de pago ${orderId.substring(0, 5)}... actualizado a: ${translatePaymentMethod(newMethod)}`);
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    // Optimistically update the UI
    const updatedOrders = ordersState?.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    // If Supabase is available, update the database
    if (supabase) {
      supabase
        .from('catering_orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating order status:", error);
            toast.error(`Error al actualizar el estado del pedido: ${error.message}`);
            // Revert to original state on error
            setOrders(orders);
          } else {
            toast.success(`Estado del pedido actualizado a: ${translateOrderStatus(newStatus)}`);
            
            // Refresh orders data
            queryClient.invalidateQueries({ queryKey: ['orders'] });
          }
        });
    } else {
      // Mock success for demo
      toast.success(`Estado de pedido ${orderId.substring(0, 5)}... actualizado a: ${translateOrderStatus(newStatus)}`);
    }
  };

  return {
    orders: ordersState,
    isLoading,
    isError,
    error,
    updatePaymentMethod,
    updateOrderStatus
  };
};
