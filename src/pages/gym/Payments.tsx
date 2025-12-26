import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Plus,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Search,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Datos de ejemplo - pagos
const mockPayments = [
  {
    id: '1',
    memberName: 'Juan Perez',
    concept: 'Membresia Mensual',
    amount: 15000,
    date: '2025-01-15',
    status: 'paid',
    method: 'Tarjeta',
  },
  {
    id: '2',
    memberName: 'Maria Garcia',
    concept: 'Membresia Trimestral',
    amount: 40000,
    date: '2025-01-10',
    status: 'paid',
    method: 'Transferencia',
  },
  {
    id: '3',
    memberName: 'Carlos Lopez',
    concept: 'Membresia Mensual',
    amount: 15000,
    date: '2025-01-05',
    status: 'pending',
    method: '-',
  },
  {
    id: '4',
    memberName: 'Ana Martinez',
    concept: 'Membresia Anual',
    amount: 120000,
    date: '2024-12-20',
    status: 'paid',
    method: 'Efectivo',
  },
  {
    id: '5',
    memberName: 'Pedro Sanchez',
    concept: 'Membresia Mensual',
    amount: 15000,
    date: '2024-12-15',
    status: 'overdue',
    method: '-',
  },
];

// Datos de ejemplo - planes
const mockPlans = [
  {
    id: '1',
    name: 'Mensual',
    price: 15000,
    duration: '1 mes',
    features: ['Acceso ilimitado', 'Clases grupales', 'Vestuarios'],
    active: true,
  },
  {
    id: '2',
    name: 'Trimestral',
    price: 40000,
    duration: '3 meses',
    features: ['Acceso ilimitado', 'Clases grupales', 'Vestuarios', '10% descuento'],
    active: true,
  },
  {
    id: '3',
    name: 'Anual',
    price: 120000,
    duration: '12 meses',
    features: ['Acceso ilimitado', 'Clases grupales', 'Vestuarios', '30% descuento', 'Invitado gratis'],
    active: true,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
};

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch = payment.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = mockPayments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalPending = mockPayments
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalOverdue = mockPayments
    .filter((p) => p.status === 'overdue')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
            <p className="text-muted-foreground">Gestiona los pagos y membresias</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Pago
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                +12% vs mes anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagados</CardTitle>
              <CreditCard className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Historial de Pagos</TabsTrigger>
            <TabsTrigger value="plans">Planes de Membresia</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Pagos</CardTitle>
                <CardDescription>Historial de pagos de los miembros</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por miembro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={statusFilter === 'paid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('paid')}
                    >
                      Pagados
                    </Button>
                    <Button
                      variant={statusFilter === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('pending')}
                    >
                      Pendientes
                    </Button>
                    <Button
                      variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('overdue')}
                    >
                      Vencidos
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Miembro</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Metodo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No se encontraron pagos
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.memberName}</TableCell>
                            <TableCell>{payment.concept}</TableCell>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payment.status === 'paid'
                                    ? 'default'
                                    : payment.status === 'pending'
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {payment.status === 'paid'
                                  ? 'Pagado'
                                  : payment.status === 'pending'
                                    ? 'Pendiente'
                                    : 'Vencido'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                                  <DropdownMenuItem>Enviar recordatorio</DropdownMenuItem>
                                  <DropdownMenuItem>Marcar como pagado</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Planes de Membresia</CardTitle>
                  <CardDescription>Configura los planes disponibles para tus miembros</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Plan
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {mockPlans.map((plan) => (
                    <Card key={plan.id} className="relative">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{plan.name}</CardTitle>
                          <Badge variant={plan.active ? 'default' : 'secondary'}>
                            {plan.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <CardDescription>{plan.duration}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">
                          {formatCurrency(plan.price)}
                        </div>
                        <ul className="space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
