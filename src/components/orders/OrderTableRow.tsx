
import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, PaymentMethod } from "@/types/order";
import { 
  translateMenuType, 
  translateStatus, 
  getStatusClass,
  translatePaymentStatus,
  getPaymentStatusClass,
  translatePaymentMethod,
  getPaymentMethodIcon
} from "./utils/orderUtils";

interface OrderTableRowProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onPaymentStatusChange?: (orderId: string, newStatus: string) => void;
  onPaymentMethodChange?: (orderId: string, newMethod: PaymentMethod) => void;
}

const OrderTableRow = ({ 
  order, 
  onStatusChange, 
  onPaymentStatusChange,
  onPaymentMethodChange
}: OrderTableRowProps) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Determinar si el estado del pedido puede ser modificado según el método de pago
  const canChangeStatus = useMemo(() => {
    if (!order.payment_method) return true;
    
    // Si es efectivo o transferencia, siempre puede cambiar
    if (order.payment_method === 'cash' || order.payment_method === 'transfer') {
      return true;
    }
    
    // Si es MercadoPago y está pagado, solo puede cambiar a cancelado o reembolsado
    if (order.payment_method === 'mercado_pago' && order.status === 'confirmed') {
      return false; // Restricción completa, luego filtramos en el renderizado
    }
    
    return true;
  }, [order.payment_method, order.status]);

  // Determinar qué estados están disponibles según el método de pago y estado actual
  const availableStatuses = useMemo(() => {
    const allStatuses = [
      { value: "pending", label: "Pendiente" },
      { value: "confirmed", label: "Pagado" },
      { value: "cancelled", label: "Cancelado" },
      { value: "refunded", label: "Reembolsado" }
    ];

    // Si es MercadoPago y está pagado, solo puede cambiar a cancelado o reembolsado
    if (order.payment_method === 'mercado_pago' && order.status === 'confirmed') {
      return allStatuses.filter(status => 
        status.value === 'cancelled' || status.value === 'refunded' || status.value === order.status
      );
    }
    
    return allStatuses;
  }, [order.payment_method, order.status]);

  return (
    <TableRow key={order.id}>
      <TableCell className="font-medium">{order.id.substring(0, 5)}...</TableCell>
      <TableCell className="max-w-[120px] truncate">{order.client_name}</TableCell>
      <TableCell className="hidden md:table-cell max-w-[150px] truncate" title={order.menu_type}>
        {translateMenuType(order.menu_type)}
      </TableCell>
      <TableCell className="text-center">{order.number_of_people}</TableCell>
      <TableCell className="hidden sm:table-cell whitespace-nowrap">{formatDate(order.event_date)}</TableCell>
      <TableCell>
        <Select 
          defaultValue={order.status} 
          onValueChange={(value) => onStatusChange(order.id, value)}
          disabled={!canChangeStatus && order.payment_method === 'mercado_pago' && order.status === 'confirmed'}
        >
          <SelectTrigger className={`h-7 w-full max-w-[180px] px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
            <SelectValue placeholder={translateStatus(order.status)} />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map(status => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Select
          defaultValue={order.payment_status || 'pending'}
          onValueChange={(value) => onPaymentStatusChange?.(order.id, value)}
        >
          <SelectTrigger className={`h-7 w-full max-w-[160px] px-2 py-1 rounded-full text-xs ${getPaymentStatusClass(order.payment_status || 'pending')}`}>
            <SelectValue placeholder={translatePaymentStatus(order.payment_status || 'pending')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <Select
          defaultValue={order.payment_method || 'cash'}
          onValueChange={(value) => onPaymentMethodChange?.(order.id, value as PaymentMethod)}
        >
          <SelectTrigger className="h-7 w-full max-w-[160px] px-2 py-1 rounded text-xs">
            <div className="flex items-center gap-1">
              <span>{getPaymentMethodIcon(order.payment_method || null)}</span>
              <SelectValue placeholder={translatePaymentMethod(order.payment_method || null)} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="mercado_pago">MercadoPago</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
};

export default OrderTableRow;
