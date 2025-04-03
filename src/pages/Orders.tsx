import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CreateOrderModal from "@/components/orders/CreateOrderModal";

interface Order {
  id: string;
  client_name: string;
  event_date: string;
  number_of_people: number;
  menu_type: string;
  special_requirements: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OrdersResponse {
  response: Order[];
}

const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch('https://api.condamind.com/v1/catering/orders', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al cargar los pedidos: ${response.status}`);
    }
    
    const data: OrdersResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("No se pudieron cargar los pedidos");
    throw error;
  }
};

const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
  } catch (error) {
    return dateString;
  }
};

const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmado',
    'in_progress': 'En preparación',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
  
  return statusMap[status] || status;
};

const getStatusClass = (status: string) => {
  const statusClassMap: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};

const Orders = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const { data: orders, isLoading, error, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const countOrders = (status?: string) => {
    if (!orders) return 0;
    
    if (!status) {
      return orders.length;
    }
    
    return orders.filter(order => order.status === status).length;
  };

  const calculateTotalRevenue = () => {
    if (!orders) return 0;
    
    return orders.reduce((total, order) => total + (order.number_of_people * 12000), 0);
  };

  const calculateTotalPeople = () => {
    if (!orders) return 0;
    
    return orders.reduce((total, order) => total + order.number_of_people, 0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Pedidos de Catering</h2>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{countOrders()}</div>
                  <p className="text-xs text-muted-foreground">
                    {countOrders('pending')} pendientes
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {orders?.filter(order => 
                      formatDate(order.created_at).startsWith(format(new Date(), "dd/MM/yyyy"))
                    ).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pedidos del día
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ingreso Estimado</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">${calculateTotalRevenue().toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Basado en {calculateTotalPeople()} personas
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Lista de los últimos pedidos de catering.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-500">
                Error al cargar los pedidos. Por favor intente nuevamente.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Menú</TableHead>
                    <TableHead>Personas</TableHead>
                    <TableHead>Fecha del Evento</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{order.client_name}</TableCell>
                        <TableCell className="max-w-xs truncate" title={order.menu_type}>
                          {order.menu_type}
                        </TableCell>
                        <TableCell>{order.number_of_people}</TableCell>
                        <TableCell>{formatDate(order.event_date)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
                            {translateStatus(order.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No hay pedidos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      <CreateOrderModal 
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </DashboardLayout>
  );
};

export default Orders;
