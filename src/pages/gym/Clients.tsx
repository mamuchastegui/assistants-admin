import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { useGymWorkoutPlans, type GymTrainerClient } from '@/hooks/gym/useGymWorkoutPlans';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import TrainerRegistrationPrompt from '@/components/gym/TrainerRegistrationPrompt';

type ClientStatus = 'pending' | 'active' | 'paused' | 'ended';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');

  const { useTrainer, useClients } = useGymWorkoutPlans();

  const { data: trainer, isLoading: trainerLoading } = useTrainer();
  const { data: clientsData, isLoading: clientsLoading } = useClients(
    trainer?.id || '',
    statusFilter === 'all' ? 'active' : statusFilter
  );

  const clients = clientsData?.clients || [];
  const totalClients = clientsData?.total || 0;

  // Filter by search term (client-side filtering)
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query)
    );
  });

  // Stats
  const activeClients = clients.filter(c => c.status === 'active').length;
  const pausedClients = clients.filter(c => c.status === 'paused').length;

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

  const formatDate = (dateString?: string | null) => {
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
        <TrainerRegistrationPrompt
          title="Accede a tus clientes"
          description="Registrate como trainer para gestionar tus clientes y hacer seguimiento de su progreso."
        />
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
            <p className="text-muted-foreground">Visualiza tus clientes vinculados</p>
          </div>
          <Button asChild variant="outline">
            <a
              href="https://gym.condamind.com/trainer"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Gestionar en Gym App
            </a>
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
                {(trainer.maxClients || 50) - totalClients} disponibles
              </p>
              <Progress value={(totalClients / (trainer.maxClients || 50)) * 100} className="h-2 mt-2" />
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
              Clientes vinculados via codigo de invitacion: <strong>{trainer.inviteCode}</strong>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No se encontraron clientes con esos filtros'
                          : 'Aun no tienes clientes vinculados. Comparte tu codigo de invitacion!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.linkId}>
                        <TableCell className="font-medium">
                          {client.name || 'Sin nombre'}
                        </TableCell>
                        <TableCell>{client.email || '-'}</TableCell>
                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {client.linkedVia === 'invite' ? 'Codigo' : 'Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(client.linkedAt)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {client.notesFromTrainer || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
