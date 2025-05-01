
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Order, PaymentMethod, OrderStatus } from "@/types/order";
import { useAuthApi } from "@/hooks/useAuthApi";

interface OrdersResponse {
  response: Order[];
}

const fetchOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching orders...');
    
    // Fetch from the API endpoint
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
    
    // Map the response to include backward compatibility fields
    return data.response.map(order => ({
      ...order,
      number_of_people: order.total_guests || 0,
      status: order.status as OrderStatus || 'pending'
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("No se pudieron cargar los pedidos");
    throw error;
  }
};

export const useOrders = () => {
  const queryClient = useQueryClient();
  const { authFetch } = useAuthApi();
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
    
    // Update via API
    fetch(`https://api.condamind.com/v1/catering/orders/${orderId}/payment-method`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'assistant-id': 'asst_OS4bPZIMBpvpYo2GMkG0ast5'
      },
      body: JSON.stringify({ payment_method: newMethod })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        toast.success(`Método de pago actualizado correctamente`);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      })
      .catch(error => {
        console.error("Error updating payment method:", error);
        toast.error(`Error al actualizar el método de pago`);
        // Revert to original state on error
        setOrders(orders);
      });
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    // Optimistically update the UI
    const updatedOrders = ordersState?.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    // Update via API
    fetch(`https://api.condamind.com/v1/catering/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'assistant-id': 'asst_OS4bPZIMBpvpYo2GMkG0ast5'
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        toast.success(`Estado del pedido actualizado correctamente`);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      })
      .catch(error => {
        console.error("Error updating order status:", error);
        toast.error(`Error al actualizar el estado del pedido`);
        // Revert to original state on error
        setOrders(orders);
      });
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
