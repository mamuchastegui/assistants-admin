
import { MenuType, PaymentMethod, OrderStatus } from "@/types/order";

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

export const translatePaymentMethod = (method: PaymentMethod | string | null): string => {
  const paymentMethodMap: Record<string, string> = {
    'cash': 'Efectivo',
    'transfer': 'Transferencia',
    'mercado_pago': 'MercadoPago'
  };
  
  if (!method) return 'No especificado';
  return paymentMethodMap[method] || method;
};

export const translateOrderStatus = (status: OrderStatus | string | null): string => {
  const statusMap: Record<string, string> = {
    'draft': 'Borrador',
    'pending': 'Pendiente',
    'approved': 'Aprobado',
    'cancelled': 'Cancelado',
    'refunded': 'Rembolsado'
  };
  
  if (!status) return 'Pendiente';
  return statusMap[status] || status;
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

export const getOrderStatusIcon = (status: OrderStatus | string | null) => {
  if (!status) return '⏳';
  
  switch (status) {
    case 'draft':
      return '📝';
    case 'pending':
      return '⏳';
    case 'approved':
      return '✅';
    case 'cancelled':
      return '❌';
    case 'refunded':
      return '↩️';
    default:
      return '⏳';
  }
};

export const getPaymentMethodClass = (method: PaymentMethod | string | null): string => {
  const methodClassMap: Record<string, string> = {
    'cash': 'bg-emerald-100 text-emerald-800',
    'transfer': 'bg-blue-100 text-blue-800',
    'mercado_pago': 'bg-purple-100 text-purple-800',
  };
  
  if (!method) return 'bg-gray-100 text-gray-800';
  return methodClassMap[method.toString()] || 'bg-gray-100 text-gray-800';
};

export const getOrderStatusClass = (status: OrderStatus | string | null): string => {
  const statusClassMap: Record<string, string> = {
    'draft': 'bg-slate-100 text-slate-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'refunded': 'bg-gray-100 text-gray-800',
  };
  
  if (!status) return 'bg-yellow-100 text-yellow-800';
  return statusClassMap[status.toString()] || 'bg-gray-100 text-gray-800';
};
