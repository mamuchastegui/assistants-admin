import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Dumbbell,
  BarChart2,
  FileText,
  Tag,
  Pause,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import {
  useGymTrainer,
  type TrainerClient,
  type ClientProgress,
  type WorkoutLog,
  type TrainerClientStatus
} from '@/hooks/gym/useGymTrainer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TrainerClientStatus>('all');
  const [selectedClient, setSelectedClient] = useState<TrainerClient | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [newClientUserId, setNewClientUserId] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const { toast } = useToast();

  const {
    useTrainerProfile,
    useListClients,
    useAddClient,
    useUpdateClient,
    useRemoveClient,
    useClientProgress,
    useClientWorkouts,
  } = useGymTrainer();

  const { data: trainer, isLoading: trainerLoading } = useTrainerProfile();
  const { data: clientsData, isLoading: clientsLoading, refetch } = useListClients({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm || undefined,
    limit: 100,
    offset: 0,
  });

  const addClientMutation = useAddClient();
  const updateClientMutation = useUpdateClient();
  const removeClientMutation = useRemoveClient();

  const clients = clientsData?.clients || [];
  const totalClients = clientsData?.total || 0;

  // Stats
  const activeClients = clients.filter(c => c.status === 'active').length;
  const pausedClients = clients.filter(c => c.status === 'paused').length;

  const handleAddClient = async () => {
    if (!newClientUserId.trim()) {
      toast({
        title: 'Error',
        description: 'Ingresa el ID del usuario',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addClientMutation.mutateAsync({
        client_user_id: newClientUserId.trim(),
        notes_from_trainer: newClientNotes.trim() || undefined,
      });
      toast({
        title: 'Cliente agregado',
        description: 'El cliente ha sido vinculado exitosamente.',
      });
      setShowAddDialog(false);
      setNewClientUserId('');
      setNewClientNotes('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo agregar el cliente.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveClient = async () => {
    if (!selectedClient) return;

    try {
      await removeClientMutation.mutateAsync(selectedClient.client_user_id);
      toast({
        title: 'Cliente desvinculado',
        description: 'El cliente ha sido desvinculado exitosamente.',
      });
      setShowRemoveDialog(false);
      setSelectedClient(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo desvincular al cliente.',
        variant: 'destructive',
      });
    }
  };

  const handlePauseClient = async (client: TrainerClient) => {
    try {
      await updateClientMutation.mutateAsync({
        clientId: client.client_user_id,
        data: { status: 'paused' as TrainerClientStatus },
      });
      toast({
        title: 'Cliente pausado',
        description: 'La vinculacion ha sido pausada.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo pausar al cliente.',
        variant: 'destructive',
      });
    }
  };

  const handleReactivateClient = async (client: TrainerClient) => {
    try {
      await updateClientMutation.mutateAsync({
        clientId: client.client_user_id,
        data: { status: 'active' as TrainerClientStatus },
      });
      toast({
        title: 'Cliente reactivado',
        description: 'La vinculacion ha sido reactivada.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo reactivar al cliente.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Activo', icon: CheckCircle },
      paused: { variant: 'secondary' as const, label: 'Pausado', icon: Pause },
      ended: { variant: 'outline' as const, label: 'Finalizado', icon: XCircle },
      pending: { variant: 'secondary' as const, label: 'Pendiente', icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return '-';
    }
  };

  if (trainerLoading || clientsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!trainer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">No eres un trainer registrado</h1>
          <p className="text-muted-foreground mb-4">
            Debes registrarte como trainer para ver tus clientes.
          </p>
          <Button onClick={() => window.location.href = '/gym/trainer-settings'}>
            Ir a Configuracion de Trainer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Clientes</h1>
            <p className="text-muted-foreground">Gestiona tus clientes vinculados</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">
                {trainer.max_clients - totalClients} disponibles
              </p>
              <Progress value={(totalClients / trainer.max_clients) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeClients}</div>
              <p className="text-xs text-muted-foreground">
                Entrenando actualmente
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pausados</CardTitle>
              <Pause className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pausedClients}</div>
              <p className="text-xs text-muted-foreground">
                En pausa temporal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              Clientes vinculados via codigo de invitacion o manualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
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
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Activos
                </Button>
                <Button
                  variant={statusFilter === 'paused' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('paused')}
                >
                  Pausados
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vinculado via</TableHead>
                    <TableHead>Fecha vinculacion</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No se encontraron clientes con esos filtros'
                          : 'Aun no tienes clientes vinculados. Comparte tu codigo de invitacion!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.client_name || 'Sin nombre'}
                        </TableCell>
                        <TableCell>{client.client_email || '-'}</TableCell>
                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {client.linked_via === 'invite' ? 'Codigo' : 'Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(client.linked_at)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {client.notes_from_trainer || '-'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedClient(client);
                                setShowDetailsSheet(true);
                              }}>
                                <BarChart2 className="h-4 w-4 mr-2" />
                                Ver progreso
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Dumbbell className="h-4 w-4 mr-2" />
                                Asignar plan
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Editar notas
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {client.status === 'active' ? (
                                <DropdownMenuItem
                                  onClick={() => handlePauseClient(client)}
                                  className="text-yellow-600"
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pausar
                                </DropdownMenuItem>
                              ) : client.status === 'paused' ? (
                                <DropdownMenuItem
                                  onClick={() => handleReactivateClient(client)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Reactivar
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setShowRemoveDialog(true);
                                }}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Desvincular
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
          </CardContent>
        </Card>

        {/* Add Client Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Cliente</DialogTitle>
              <DialogDescription>
                Vincula un cliente manualmente usando su ID de usuario.
                Normalmente los clientes se vinculan usando tu codigo de invitacion.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client_user_id">ID del Usuario</Label>
                <Input
                  id="client_user_id"
                  value={newClientUserId}
                  onChange={(e) => setNewClientUserId(e.target.value)}
                  placeholder="UUID del usuario"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  placeholder="Notas sobre este cliente..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddClient} disabled={addClientMutation.isPending}>
                {addClientMutation.isPending ? 'Agregando...' : 'Agregar Cliente'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Dialog */}
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Desvincular Cliente</DialogTitle>
              <DialogDescription>
                Esta accion desvinculara a {selectedClient?.client_name || 'este cliente'}.
                Podras volver a vincularlo mas tarde.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleRemoveClient}>
                Desvincular
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Client Details Sheet */}
        <ClientDetailsSheet
          client={selectedClient}
          open={showDetailsSheet}
          onOpenChange={setShowDetailsSheet}
        />
      </div>
    </DashboardLayout>
  );
};

// Client Details Sheet Component
const ClientDetailsSheet = ({
  client,
  open,
  onOpenChange,
}: {
  client: TrainerClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { useClientProgress, useClientWorkouts } = useGymTrainer();

  const { data: progress, isLoading: progressLoading } = useClientProgress(client?.client_user_id || '');
  const { data: workoutsData, isLoading: workoutsLoading } = useClientWorkouts(client?.client_user_id || '', 10);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return '-';
    }
  };

  if (!client) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{client.client_name || 'Cliente'}</SheetTitle>
          <SheetDescription>
            {client.client_email || 'Sin email'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Progress Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Estadisticas</h3>
            {progressLoading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : progress ? (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{progress.total_workouts}</div>
                    <p className="text-xs text-muted-foreground">Entrenamientos totales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{progress.workouts_this_week}</div>
                    <p className="text-xs text-muted-foreground">Esta semana</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{progress.workouts_this_month}</div>
                    <p className="text-xs text-muted-foreground">Este mes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{progress.average_rpe?.toFixed(1) || '-'}</div>
                    <p className="text-xs text-muted-foreground">RPE promedio</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-muted-foreground">Sin datos de progreso</p>
            )}
          </div>

          {/* Recent Workouts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Ultimos Entrenamientos</h3>
            {workoutsLoading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : workoutsData?.logs && workoutsData.logs.length > 0 ? (
              <div className="space-y-3">
                {workoutsData.logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{log.day_name || 'Entrenamiento'}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.muscle_groups?.join(', ') || 'Sin grupos musculares'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatDate(log.completed_at)}</p>
                          {log.rpe && (
                            <Badge variant="outline" className="text-xs">
                              RPE {log.rpe}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {log.duration_minutes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Duracion: {log.duration_minutes} min
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sin entrenamientos registrados</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Clients;
