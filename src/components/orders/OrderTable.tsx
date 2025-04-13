
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OrderTableRow from "./OrderTableRow";
import { Order, PaymentMethod, OrderStatus } from "@/types/order";

interface OrderTableProps {
  orders?: Order[];
  isLoading: boolean;
  isError: boolean;
  onPaymentMethodChange?: (orderId: string, newMethod: PaymentMethod) => void;
  onOrderStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderTable = ({ 
  orders, 
  isLoading, 
  isError,
  onPaymentMethodChange,
  onOrderStatusChange
}: OrderTableProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Pedidos Recientes</CardTitle>
        <CardDescription>
          Lista de los últimos pedidos de catering.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error al cargar los pedidos. Por favor intente nuevamente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Menú</TableHead>
                  <TableHead className="w-[80px] text-center">Personas</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="w-[50px]">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderTableRow 
                      key={order.id} 
                      order={order}
                      onPaymentMethodChange={onPaymentMethodChange}
                      onOrderStatusChange={onOrderStatusChange}
                    />
                  ))
                ) : (
                  <TableRow>
                    <td colSpan={8} className="text-center py-4">
                      No hay pedidos disponibles
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTable;
