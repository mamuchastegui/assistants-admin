
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { Loader2, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OrderTableRow from "./OrderTableRow";
import { Order, PaymentMethod, OrderStatus } from "@/types/order";
import { Button } from "@/components/ui/button";

interface OrderTableProps {
  orders?: Order[];
  isLoading: boolean;
  isError: boolean;
  onPaymentMethodChange?: (orderId: string, newMethod: PaymentMethod) => void;
  onOrderStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

type SortField = "created_at" | "client_name" | "total_guests" | "event_date";
type SortOrder = "asc" | "desc";

const OrderTable = ({ 
  orders: initialOrders, 
  isLoading, 
  isError,
  onPaymentMethodChange,
  onOrderStatusChange
}: OrderTableProps) => {
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortOrders = (a: Order, b: Order) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const orders = initialOrders ? [...initialOrders].sort(sortOrders) : [];

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-8 px-2 flex items-center gap-1 hover:bg-muted/30"
    >
      {label}
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );

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
                  <TableHead>{renderSortButton("client_name", "Cliente")}</TableHead>
                  <TableHead className="hidden md:table-cell">Menú</TableHead>
                  <TableHead className="w-[80px] text-center">
                    {renderSortButton("total_guests", "Personas")}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {renderSortButton("event_date", "Fecha Evento")}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {renderSortButton("created_at", "Creado")}
                  </TableHead>
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
                    <td colSpan={9} className="text-center py-4">
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
