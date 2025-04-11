
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  details: Record<string, any>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as PaymentMethod[];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    toast.error("No se pudieron cargar los métodos de pago");
    return [];
  }
};

export const getPaymentMethodById = async (id: string): Promise<PaymentMethod | null> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as PaymentMethod;
  } catch (error) {
    console.error("Error fetching payment method:", error);
    return null;
  }
};

export const translatePaymentType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'cash': 'Efectivo',
    'transfer': 'Transferencia',
    'alias': 'Alias',
    'cbu': 'CBU',
    'credit_card': 'Tarjeta de Crédito',
    'debit_card': 'Tarjeta de Débito',
    'mercado_pago': 'MercadoPago',
    'other': 'Otro'
  };
  
  return typeMap[type] || type;
};

export const translatePaymentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'failed': 'Fallido',
    'refunded': 'Reembolsado',
    'partial': 'Parcial'
  };
  
  return statusMap[status] || status;
};

export const getPaymentStatusClass = (status: string): string => {
  const statusClassMap: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'refunded': 'bg-blue-100 text-blue-800',
    'partial': 'bg-purple-100 text-purple-800'
  };
  
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};
