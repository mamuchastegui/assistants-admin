
import React, { useMemo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, PaymentMethod, OrderStatus } from "@/types/order";
import { 
  translateMenuType, 
  translatePaymentMethod,
  getPaymentMethodIcon,
  getPaymentMethodClass,
  translateOrderStatus,
  getOrderStatusIcon,
  getOrderStatusClass
} from "./utils/orderUtils";

interface OrderTableRowProps {
  order: Order;
  onPaymentMethodChange?: (orderId: string, newMethod: PaymentMethod) => void;
  onOrderStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderTableRow = ({ 
  order, 
  onPaymentMethodChange,
  onOrderStatusChange
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

  // Determine if the payment method can be modified
  const canChangePaymentMethod = useMemo(() => {
    // If it's MercadoPago and already confirmed payment, don't allow changes
    if (order.payment_method === 'mercado_pago' && order.payment_status === 'paid') {
      return false;
    }
    
    return true;
  }, [order.payment_method, order.payment_status]);

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
          defaultValue={order.status || 'pending'}
          onValueChange={(value) => onOrderStatusChange?.(order.id, value as OrderStatus)}
        >
          <SelectTrigger className={`h-7 w-full max-w-[160px] px-2 py-1 rounded-full text-xs ${getOrderStatusClass(order.status || 'pending')}`}>
            <div className="flex items-center gap-1">
              <span>{getOrderStatusIcon(order.status || 'pending')}</span>
              <SelectValue placeholder={translateOrderStatus(order.status || 'pending')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="approved">Aprobado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="refunded">Rembolsado</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          defaultValue={order.payment_method || 'cash'}
          onValueChange={(value) => onPaymentMethodChange?.(order.id, value as PaymentMethod)}
          disabled={!canChangePaymentMethod}
        >
          <SelectTrigger className={`h-7 w-full max-w-[160px] px-2 py-1 rounded-full text-xs ${getPaymentMethodClass(order.payment_method || 'cash')}`}>
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
