
export const translateMenuType = (menuType: string): string => {
  const menuTypeMap: Record<string, string> = {
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
    'confirmed': 'Confirmado',
    'cancelled': 'Cancelado',
    'waiting': 'En espera',
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
