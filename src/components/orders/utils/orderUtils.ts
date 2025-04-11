
import { MenuType, PaymentMethod } from "@/types/order";

export const translateMenuType = (menuType: MenuType): string => {
  const menuTypeMap: Record<MenuType, string> = {
    'standard': 'Estándar',
    'vegetarian': 'Vegetariano',
    'vegan': 'Vegano',
    'gluten_free': 'Sin Gluten',
    'premium': 'Premium',
    'custom': 'Personalizado'
  };
  
  return menuTypeMap[menuType] || menuType;
};

export const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'confirmed': 'Pagado',
    'cancelled': 'Cancelado',
    'refunded': 'Reembolsado'
  };
  
  return statusMap[status] || status;
};

export const getStatusClass = (status: string): string => {
  const statusClassMap: Record<string, string> = {
    'pending': 'bg-amber-100 text-amber-800',
    'confirmed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-700',
    'refunded': 'bg-purple-100 text-purple-800',
  };
  
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};

export const translatePaymentStatus = (status: string): string => {
  const paymentStatusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'cancelled': 'Cancelado',
    'refunded': 'Reembolsado'
  };
  
  return paymentStatusMap[status] || status;
};

export const getPaymentStatusClass = (status: string): string => {
  const paymentStatusClassMap: Record<string, string> = {
    'pending': 'bg-amber-100 text-amber-800',
    'paid': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-700',
    'refunded': 'bg-purple-100 text-purple-800',
  };
  
  return paymentStatusClassMap[status] || 'bg-gray-100 text-gray-800';
};

export const translatePaymentMethod = (method: PaymentMethod | string | null): string => {
  const paymentMethodMap: Record<string, string> = {
    'cash': 'Efectivo',
    'transfer': 'Transferencia',
    'mercado_pago': 'MercadoPago'
  };
  
  if (!method) return 'No especificado';
  return paymentMethodMap[method] || method;
};

export const getPaymentMethodIcon = (method: PaymentMethod | string | null) => {
  if (!method) return '❓';
  
  switch (method) {
    case 'cash':
      return '💵';
    case 'transfer':
      return '🏦';
    case 'mercado_pago':
      return '💳';
    default:
      return '💰';
  }
};
