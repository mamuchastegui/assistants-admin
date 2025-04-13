
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, FileText, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { Accordion } from "@/components/ui/accordion";
import { useOrders } from "@/hooks/useOrders";
import OrderDetailCard from "@/components/orders/OrderDetailCard";
import GuestList from "@/components/orders/GuestList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, isLoading } = useOrders();

  const order = orders?.find(o => o.id === orderId);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <PageHeader
            title="Cargando detalles del pedido..."
            actions={
              <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            }
          />
          <div className="grid gap-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <PageHeader
            title="Pedido no encontrado"
            actions={
              <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            }
          />
          <Card>
            <CardContent className="pt-6">
              <p>El pedido solicitado no existe o ha sido eliminado.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const totalMenus = order.menus?.length || 0;
  const totalGuests = order.total_guests || order.number_of_people || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`Pedido: ${order.client_name}`}
          description={`ID: ${orderId}`}
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Pedidos
            </Button>
          }
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <OrderDetailCard 
            title="Fecha del Evento" 
            value={formatDate(order.event_date)}
            icon={<Calendar className="h-4 w-4" />}
          />
          <OrderDetailCard 
            title="Total de Personas" 
            value={totalGuests.toString()}
            icon={<User className="h-4 w-4" />}
          />
          <OrderDetailCard 
            title="Menús" 
            value={totalMenus.toString()}
            icon={<FileText className="h-4 w-4" />}
          />
          <OrderDetailCard 
            title="Monto Total" 
            value={`$${order.total_amount.toLocaleString()}`}
            icon={<CreditCard className="h-4 w-4" />}
          />
        </div>

        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {order.menus && order.menus.length > 0 && (
          <GuestList menus={order.menus} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrderDetails;
