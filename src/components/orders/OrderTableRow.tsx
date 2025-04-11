
import React from "react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order } from "@/types/order";
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
}

const OrderTableRow = ({ order, onStatusChange, onPaymentStatusChange }: OrderTableRowProps) => {
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
        >
          <SelectTrigger className={`h-7 w-full max-w-[180px] px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
            <SelectValue placeholder={translateStatus(order.status)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="waiting">En espera</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="refunded">Rembolsado</SelectItem>
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
            <SelectItem value="refunded">Rembolsado</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        {order.payment_method && (
          <div className="flex items-center gap-1">
            <span>{getPaymentMethodIcon(order.payment_method)}</span>
            <span>{translatePaymentMethod(order.payment_method)}</span>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default OrderTableRow;
