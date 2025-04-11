
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

export const getPaymentMethodClass = (method: PaymentMethod | string | null): string => {
  const methodClassMap: Record<string, string> = {
    'cash': 'bg-emerald-100 text-emerald-800',
    'transfer': 'bg-blue-100 text-blue-800',
    'mercado_pago': 'bg-purple-100 text-purple-800',
  };
  
  if (!method) return 'bg-gray-100 text-gray-800';
  return methodClassMap[method.toString()] || 'bg-gray-100 text-gray-800';
};
