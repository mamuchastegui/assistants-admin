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
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    'cancelled': 'Cancelado',
    'processed': 'Procesado',
    'waiting': 'En espera',
    'failed': 'Fallido',
    'completed': 'Completado',
    'refunded': 'Rembolsado',
    'pending_payment': 'Pendiente de pago'
  };
  
  return statusMap[status] || status;
};

const getStatusClass = (status: string) => {
  const statusClassMap: Record<string, string> = {
    'pending': 'bg-amber-100 text-amber-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-200 text-gray-700',
    'processed': 'bg-green-100 text-green-800',
    'waiting': 'bg-yellow-100 text-yellow-800',
    'failed': 'bg-red-100 text-red-800',
    'completed': 'bg-cyan-100 text-cyan-800',
    'refunded': 'bg-gray-300 text-gray-800',
    'pending_payment': 'bg-gray-100 text-gray-700'
  };
  
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};

const Orders = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const { data: orders, isLoading, error, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    toast.success(`Estado del pedido ${orderId} actualizado a: ${translateStatus(newStatus)}`);
  };

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
        <PageHeader
          title="Pedidos de Catering"
          actions={
            <Button onClick={() => setCreateModalOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Pedido</span>
            </Button>
          }
        />
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
          
          <Card className="sm:col-span-2 lg:col-span-1">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.substring(0, 5)}...</TableCell>
                          <TableCell className="max-w-[120px] truncate">{order.client_name}</TableCell>
                          <TableCell className="hidden md:table-cell max-w-[150px] truncate" title={order.menu_type}>
                            {order.menu_type}
                          </TableCell>
                          <TableCell className="text-center">{order.number_of_people}</TableCell>
                          <TableCell className="hidden sm:table-cell whitespace-nowrap">{formatDate(order.event_date)}</TableCell>
                          <TableCell>
                            <Select 
                              defaultValue={order.status} 
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className={`h-7 w-full max-w-[180px] px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
                                <SelectValue placeholder={translateStatus(order.status)} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="pending_payment">Pendiente de pago</SelectItem>
                                <SelectItem value="processed">Procesado</SelectItem>
                                <SelectItem value="waiting">En espera</SelectItem>
                                <SelectItem value="confirmed">Confirmado</SelectItem>
                                <SelectItem value="in_progress">En preparación</SelectItem>
                                <SelectItem value="completed">Completado</SelectItem>
                                <SelectItem value="delivered">Entregado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                                <SelectItem value="failed">Fallido</SelectItem>
                                <SelectItem value="refunded">Rembolsado</SelectItem>
                              </SelectContent>
                            </Select>
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
              </div>
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
