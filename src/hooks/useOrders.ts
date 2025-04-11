
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Order, MenuType, PaymentMethod } from "@/types/order";
import { supabase } from "@/lib/supabase";

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
      
      return data as Order[];
    } else {
      // Fallback to the mock API if Supabase is not configured
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

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    // Find the order to check payment method
    const order = ordersState?.find(o => o.id === orderId);
    
    // Validar reglas de negocio
    if (order?.payment_method === 'mercado_pago' && order.status === 'confirmed' && 
        newStatus !== 'cancelled' && newStatus !== 'refunded') {
      toast.error("Los pedidos pagados por MercadoPago solo pueden cambiarse a Cancelado o Reembolsado");
      return;
    }
    
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
            toast.success(`Estado del pedido actualizado a: ${newStatus}`);
            // Refresh orders data
            queryClient.invalidateQueries({ queryKey: ['orders'] });
          }
        });
    } else {
      // Mock success for demo
      toast.success(`Estado del pedido ${orderId.substring(0, 5)}... actualizado a: ${newStatus}`);
    }
  };

  const updatePaymentStatus = (orderId: string, newStatus: string) => {
    // Optimistically update the UI
    const updatedOrders = ordersState?.map(order =>
      order.id === orderId ? { ...order, payment_status: newStatus as any } : order
    );
    setOrders(updatedOrders);
    
    // If Supabase is available, update the database
    if (supabase) {
      supabase
        .from('catering_orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating payment status:", error);
            toast.error(`Error al actualizar el estado del pago: ${error.message}`);
            // Revert to original state on error
            setOrders(orders);
          } else {
            toast.success(`Estado del pago actualizado a: ${newStatus}`);
            
            // If the payment is now paid, update any pending payments associated with this order
            if (newStatus === 'paid') {
              supabase
                .from('order_payments')
                .update({ payment_status: newStatus })
                .eq('order_id', orderId)
                .eq('payment_status', 'pending');
            }
            
            // Refresh orders data
            queryClient.invalidateQueries({ queryKey: ['orders'] });
          }
        });
    } else {
      // Mock success for demo
      toast.success(`Estado del pago ${orderId.substring(0, 5)}... actualizado a: ${newStatus}`);
    }
  };

  const updatePaymentMethod = (orderId: string, newMethod: PaymentMethod) => {
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

  return {
    orders: ordersState,
    isLoading,
    isError,
    error,
    updateOrderStatus,
    updatePaymentStatus,
    updatePaymentMethod
  };
};

// Esta es una función auxiliar interna que debemos importar del archivo orderUtils.ts
// pero la definimos aquí para evitar problemas de importación circular
const translatePaymentMethod = (method: PaymentMethod | string | null): string => {
  const paymentMethodMap: Record<string, string> = {
    'cash': 'Efectivo',
    'transfer': 'Transferencia',
    'mercado_pago': 'MercadoPago'
  };
  
  if (!method) return 'No especificado';
  return paymentMethodMap[method] || method.toString();
};
