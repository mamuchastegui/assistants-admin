
import { MenuType } from "@/types/order";

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
    'pending': 'Pending',
    'confirmed': 'Paid',
    'cancelled': 'Canceled',
    'waiting': 'Rembolsado',
    'refunded': 'Rembolsado'
  };
  
  return statusMap[status] || status;
};

export const getStatusClass = (status: string): string => {
  const statusClassMap: Record<string, string> = {
    'pending': 'bg-amber-100 text-amber-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-[#F1F0FB] text-gray-700',
    'waiting': 'bg-[#FEF7CD] text-yellow-800',
    'refunded': 'bg-[#F1F0FB] text-gray-800',
  };
  
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};

export const translatePaymentStatus = (status: string): string => {
  const paymentStatusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'cancelled': 'Cancelado',
    'refunded': 'Rembolsado'
  };
  
  return paymentStatusMap[status] || status;
};

export const getPaymentStatusClass = (status: string): string => {
  const paymentStatusClassMap: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    'refunded': 'bg-purple-100 text-purple-800',
  };
  
  return paymentStatusClassMap[status] || 'bg-gray-100 text-gray-800';
};

export const translatePaymentMethod = (method: string): string => {
  const paymentMethodMap: Record<string, string> = {
    'cash': 'Efectivo',
    'transfer': 'Transferencia',
    'mercado_pago': 'MercadoPago',
    'card': 'Tarjeta',
    'check': 'Cheque'
  };
  
  return paymentMethodMap[method] || method;
};

export const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'cash':
      return '💵';
    case 'transfer':
      return '🏦';
    case 'mercado_pago':
      return '💳';
    case 'card':
      return '💳';
    case 'check':
      return '🧾';
    default:
      return '💰';
  }
};
