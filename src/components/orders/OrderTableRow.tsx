
import React from "react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { translatePaymentStatus, getPaymentStatusClass } from "@/services/paymentService";
import { Order } from "@/types/order";
import { translateMenuType } from "./utils/orderUtils";

interface OrderTableRowProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const OrderTableRow = ({ order, onStatusChange }: OrderTableRowProps) => {
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

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'cancelled': 'Cancelado',
      'waiting': 'En espera',
      'refunded': 'Rembolsado'
    };
    
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const statusClassMap: Record<string, string> = {
      'pending': 'bg-amber-100 text-amber-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-[#F1F0FB] text-gray-700',
      'waiting': 'bg-[#FEF7CD] text-yellow-800',
      'refunded': 'bg-[#F1F0FB] text-gray-800',
    };
    
    return statusClassMap[status] || 'bg-gray-100 text-gray-800';
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
        {order.payment_status && (
          <Badge variant="outline" className={getPaymentStatusClass(order.payment_status)}>
            {translatePaymentStatus(order.payment_status)}
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
};

export default OrderTableRow;
