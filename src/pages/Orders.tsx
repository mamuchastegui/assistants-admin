
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/button";

// Datos de ejemplo para mostrar en la tabla
const ordersMock = [
  {
    id: "1",
    customerName: "Juan Pérez",
    items: "Pizza Margarita, Refresco",
    total: "$18.50",
    status: "Entregado",
    date: "2023-10-15 14:30",
  },
  {
    id: "2",
    customerName: "María López",
    items: "Hamburguesa Doble, Papas Fritas, Agua",
    total: "$15.75",
    status: "En preparación",
    date: "2023-10-15 15:45",
  },
  {
    id: "3",
    customerName: "Carlos Rodríguez",
    items: "Ensalada César, Jugo Natural",
    total: "$12.25",
    status: "En camino",
    date: "2023-10-15 16:20",
  },
  {
    id: "4",
    customerName: "Ana García",
    items: "Pasta Alfredo, Vino Tinto",
    total: "$27.50",
    status: "Pendiente",
    date: "2023-10-15 18:00",
  },
  {
    id: "5",
    customerName: "Roberto Sánchez",
    items: "Tacos (4), Nachos, Cerveza",
    total: "$22.75",
    status: "Cancelado",
    date: "2023-10-15 19:15",
  },
];

const Orders = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Pedidos de Comida</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">+4% respecto al mes pasado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">-2% respecto a ayer</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ingreso Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,482.50</div>
              <p className="text-xs text-muted-foreground">+8% respecto al mes pasado</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Lista de los últimos pedidos realizados por los clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersMock.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "Entregado" ? "bg-green-100 text-green-800" :
                        order.status === "En preparación" ? "bg-blue-100 text-blue-800" :
                        order.status === "En camino" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "Cancelado" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
