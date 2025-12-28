import React, { useState, useMemo } from 'react';
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
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useGymPayments } from '@/hooks/gym/useGymPayments';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
};

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'cancelled'>('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const { toast } = useToast();

  const {
    useListPayments,
    usePendingPayments,
    useOverduePayments,
    usePaymentSummary,
    useRevenueByType,
    useUpdatePaymentStatus,
    useProcessRefund,
  } = useGymPayments();

  // Dates for summary
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  // Fetch payments
  const { data: paymentsData, isLoading } = useListPayments({
    status: statusFilter === 'all' ? undefined : statusFilter,
    from_date: format(currentMonthStart, 'yyyy-MM-dd'),
    to_date: format(currentMonthEnd, 'yyyy-MM-dd'),
    limit: 100,
  });

  // Fetch pending and overdue
  const { data: pendingPayments } = usePendingPayments(false);
  const { data: overduePayments } = useOverduePayments();

  // Fetch summary
  const { data: summary } = usePaymentSummary(
    format(currentMonthStart, 'yyyy-MM-dd'),
    format(currentMonthEnd, 'yyyy-MM-dd')
  );

  // Fetch revenue by type
  const { data: revenueData } = useRevenueByType(
    format(currentMonthStart, 'yyyy-MM-dd'),
    format(currentMonthEnd, 'yyyy-MM-dd')
  );

  // Mutations
  const updatePaymentStatus = useUpdatePaymentStatus();
  const processRefund = useProcessRefund();

  const payments = paymentsData?.payments || [];

  // Filter payments by search
  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;

    return payments.filter((payment: any) =>
      payment.member_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.external_payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payments, searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, label: 'Pagado', icon: CheckCircle, color: 'text-green-500' },
      pending: { variant: 'secondary' as const, label: 'Pendiente', icon: Clock, color: 'text-yellow-500' },
      processing: { variant: 'outline' as const, label: 'Procesando', icon: RefreshCw, color: 'text-blue-500' },
      failed: { variant: 'destructive' as const, label: 'Fallido', icon: XCircle, color: 'text-red-500' },
      cancelled: { variant: 'outline' as const, label: 'Cancelado', icon: XCircle, color: 'text-gray-500' },
      refunded: { variant: 'secondary' as const, label: 'Reembolsado', icon: RefreshCw, color: 'text-purple-500' },
      partially_refunded: { variant: 'secondary' as const, label: 'Reembolso parcial', icon: RefreshCw, color: 'text-purple-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Efectivo',
      credit_card: 'Tarjeta de Crédito',
      debit_card: 'Tarjeta de Débito',
      bank_transfer: 'Transferencia',
      mercadopago: 'MercadoPago',
      check: 'Cheque',
      other: 'Otro',
    };
    return methods[method] || method || '-';
  };

  const getPaymentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      membership: 'Membresía',
      enrollment: 'Inscripción',
      renewal: 'Renovación',
      class: 'Clase',
      personal_training: 'Entrenamiento Personal',
      product: 'Producto',
      penalty: 'Penalidad',
      other: 'Otro',
    };
    return types[type] || type;
  };

  const handleMarkAsPaid = async (payment: any) => {
    try {
      await updatePaymentStatus.mutateAsync({
        paymentId: payment.payment_id,
        status: 'completed',
        processed_at: new Date().toISOString(),
      });
      toast({
        title: 'Pago marcado como completado',
        description: 'El pago ha sido marcado como completado exitosamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pago.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsFailed = async (payment: any) => {
    try {
      await updatePaymentStatus.mutateAsync({
        paymentId: payment.payment_id,
        status: 'failed',
      });
      toast({
        title: 'Pago marcado como fallido',
        description: 'El pago ha sido marcado como fallido.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pago.',
        variant: 'destructive',
      });
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) return;

    try {
      await processRefund.mutateAsync({
        paymentId: selectedPayment.payment_id,
        amount: parseFloat(refundAmount),
        reason: refundReason,
      });
      toast({
        title: 'Reembolso procesado',
        description: 'El reembolso ha sido procesado exitosamente.',
      });
      setIsRefundDialogOpen(false);
      setSelectedPayment(null);
      setRefundAmount('');
      setRefundReason('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo procesar el reembolso.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return '-';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
            <p className="text-muted-foreground">Gestiona los pagos y membresías</p>
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
              <div className="text-2xl font-bold">{formatCurrency(summary?.total_revenue || 0)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {summary?.completed_payments || 0} pagos completados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagados</CardTitle>
              <CreditCard className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.total_revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.completed_payments || 0} transacciones
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summary?.pending_amount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingPayments?.length || 0} pagos pendientes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {overduePayments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Requieren seguimiento</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Historial de Pagos</TabsTrigger>
            <TabsTrigger value="revenue">Ingresos por Tipo</TabsTrigger>
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
                      placeholder="Buscar por miembro o descripción..."
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
                      variant={statusFilter === 'completed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('completed')}
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
                      variant={statusFilter === 'failed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('failed')}
                    >
                      Fallidos
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">Cargando pagos...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Miembro</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No se encontraron pagos
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPayments.map((payment: any) => (
                            <TableRow key={payment.payment_id}>
                              <TableCell className="font-mono text-xs">
                                {payment.payment_id.substring(0, 8)}...
                              </TableCell>
                              <TableCell>{payment.member_id.substring(0, 8)}...</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {getPaymentTypeLabel(payment.payment_type)}
                                  </span>
                                  {payment.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {payment.description}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {formatCurrency(payment.amount)}
                                  </span>
                                  {payment.refunded_amount > 0 && (
                                    <span className="text-xs text-purple-600">
                                      Reembolsado: {formatCurrency(payment.refunded_amount)}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{formatDate(payment.payment_date || payment.created_at)}</span>
                                  {payment.due_date && payment.is_overdue && (
                                    <span className="text-xs text-red-500">
                                      Vencido hace {payment.days_overdue} días
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getPaymentMethodLabel(payment.payment_method)}</TableCell>
                              <TableCell>{getStatusBadge(payment.status)}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Download className="mr-2 h-4 w-4" />
                                      Ver detalle
                                    </DropdownMenuItem>
                                    {payment.payment_link && (
                                      <DropdownMenuItem
                                        onClick={() => window.open(payment.payment_link, '_blank')}
                                      >
                                        <Send className="mr-2 h-4 w-4" />
                                        Ver link de pago
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    {payment.status === 'pending' && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handleMarkAsPaid(payment)}
                                          className="text-green-600"
                                        >
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Marcar como pagado
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleMarkAsFailed(payment)}
                                          className="text-red-600"
                                        >
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Marcar como fallido
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {payment.status === 'completed' && payment.amount > payment.refunded_amount && (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedPayment(payment);
                                          setIsRefundDialogOpen(true);
                                        }}
                                        className="text-purple-600"
                                      >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Procesar reembolso
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem>
                                      <Send className="mr-2 h-4 w-4" />
                                      Enviar recordatorio
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Tipo</CardTitle>
                <CardDescription>Desglose de ingresos del mes actual</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueData && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(revenueData.revenue_by_type).map(([type, amount]) => (
                        <Card key={type}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                              {getPaymentTypeLabel(type)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
                            <p className="text-xs text-muted-foreground">
                              {Math.round((amount / revenueData.total) * 100)}% del total
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total del período:</span>
                        <span className="text-2xl font-bold">{formatCurrency(revenueData.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Refund Dialog */}
        <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Procesar Reembolso</DialogTitle>
              <DialogDescription>
                Ingresa el monto y motivo del reembolso para el pago #{selectedPayment?.payment_id.substring(0, 8)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Monto a reembolsar</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={selectedPayment?.remaining_amount}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Monto máximo: {formatCurrency(selectedPayment?.remaining_amount || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Motivo del reembolso</label>
                <Input
                  placeholder="Ingrese el motivo del reembolso..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleRefund}
                disabled={!refundAmount || !refundReason || parseFloat(refundAmount) <= 0}
              >
                Procesar Reembolso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Payments;