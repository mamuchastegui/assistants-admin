import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreHorizontal,
  Eye,
  Dumbbell,
  Users,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGymWorkoutPlans, type GymWorkoutPlan } from '@/hooks/gym/useGymWorkoutPlans';
import { useGymTrainer } from '@/hooks/gym/useGymTrainer';
import TrainerRegistrationPrompt from '@/components/gym/TrainerRegistrationPrompt';

const WorkoutPlans: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'all' | 'by-client'>('all');

  const { usePlans, useTrainerClientPlans } = useGymWorkoutPlans();
  const { useTrainerProfile } = useGymTrainer();

  // Check if user is a trainer
  const { data: trainer, isLoading: trainerLoading } = useTrainerProfile();

  // Queries - get plans from personal-os-console
  const { data: plansData, isLoading: loadingPlans } = usePlans();
  const { data: trainerClientData, isLoading: loadingClientPlans } = useTrainerClientPlans(trainer?.id || '');

  const allPlans = plansData?.plans || [];
  const activePlans = allPlans.filter(p => p.status === 'active');

  // Filter plans based on search
  const filteredPlans = allPlans.filter(plan => {
    const query = searchQuery.toLowerCase();
    const programName = plan.plan?.programName?.toLowerCase() || '';
    const userName = plan.user?.name?.toLowerCase() || '';
    const userEmail = plan.user?.email?.toLowerCase() || '';
    return (
      programName.includes(query) ||
      userName.includes(query) ||
      userEmail.includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      archived: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getLevelColor = (level?: string) => {
    const colors: Record<string, string> = {
      principiante: 'bg-green-100 text-green-700',
      intermedio: 'bg-yellow-100 text-yellow-700',
      avanzado: 'bg-orange-100 text-orange-700',
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-orange-100 text-orange-700',
    };
    return colors[level?.toLowerCase() || ''] || 'bg-gray-100 text-gray-700';
  };

  // Show loading while checking trainer status
  if (trainerLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  // Show registration prompt if not a trainer
  if (!trainer) {
    return (
      <div className="p-6">
        <TrainerRegistrationPrompt
          title="Accede a los Planes de Entrenamiento"
          description="Registrate como trainer para crear y gestionar planes de entrenamiento personalizados."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planes de Entrenamiento</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza los planes de entrenamiento de tus clientes
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Los planes se crean desde gym.condamind.com
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planes</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPlans.length}</div>
            <p className="text-xs text-muted-foreground">
              De todos tus clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans.length}</div>
            <p className="text-xs text-muted-foreground">
              En progreso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes con Plan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainerClientData?.clientCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clientes vinculados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5" />
              <CardTitle>Planes de Clientes</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as 'all' | 'by-client')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">Todos los Planes</TabsTrigger>
              <TabsTrigger value="by-client">Por Cliente</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loadingPlans ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando planes...</p>
                </div>
              ) : (
                <PlansList
                  plans={filteredPlans}
                  getStatusColor={getStatusColor}
                  getLevelColor={getLevelColor}
                />
              )}
            </TabsContent>

            <TabsContent value="by-client" className="space-y-4">
              {loadingClientPlans ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando planes por cliente...</p>
                </div>
              ) : trainerClientData?.plansByClient?.length ? (
                <div className="space-y-6">
                  {trainerClientData.plansByClient.map((clientGroup) => (
                    <Card key={clientGroup.client.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {clientGroup.client.name || clientGroup.client.email}
                        </CardTitle>
                        <CardDescription>{clientGroup.client.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PlansList
                          plans={clientGroup.plans}
                          getStatusColor={getStatusColor}
                          getLevelColor={getLevelColor}
                          compact
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">Sin clientes vinculados</p>
                  <p className="text-muted-foreground">
                    Comparte tu código de invitación para que tus clientes se vinculen
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Plans List Component - displays plans from personal-os-console
const PlansList: React.FC<{
  plans: GymWorkoutPlan[];
  getStatusColor: (status: string) => string;
  getLevelColor: (level?: string) => string;
  compact?: boolean;
}> = ({
  plans,
  getStatusColor,
  getLevelColor,
  compact = false,
}) => {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold">No hay planes disponibles</p>
        <p className="text-muted-foreground">
          Los clientes pueden crear planes desde gym.condamind.com
        </p>
      </div>
    );
  }

  // Get workout days count
  const getWorkoutDays = (plan: GymWorkoutPlan) => {
    const weeklyPlan = plan.plan?.weeklyPlan;
    if (!weeklyPlan) return 0;
    return Object.keys(weeklyPlan).length;
  };

  // Get total exercises count
  const getTotalExercises = (plan: GymWorkoutPlan) => {
    const weeklyPlan = plan.plan?.weeklyPlan;
    if (!weeklyPlan) return 0;
    return Object.values(weeklyPlan).reduce((total, day) => {
      return total + (day.exercises?.length || 0);
    }, 0);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan</TableHead>
          {!compact && <TableHead>Cliente</TableHead>}
          <TableHead>Días/Semana</TableHead>
          <TableHead>Ejercicios</TableHead>
          <TableHead>Nivel</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell>
              <div>
                <p className="font-medium">
                  {plan.plan?.programName || 'Plan sin nombre'}
                </p>
                {plan.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    Creado {format(new Date(plan.createdAt), 'dd/MM/yyyy', { locale: es })}
                  </p>
                )}
              </div>
            </TableCell>
            {!compact && (
              <TableCell>
                <div>
                  <p className="font-medium">{plan.user?.name || 'Sin nombre'}</p>
                  <p className="text-xs text-muted-foreground">{plan.user?.email}</p>
                </div>
              </TableCell>
            )}
            <TableCell>
              <div className="text-sm">
                <p>{getWorkoutDays(plan)} días</p>
                <p className="text-muted-foreground text-xs">
                  {plan.plan?.request?.splitType || 'Rutina completa'}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm">{getTotalExercises(plan)} ejercicios</span>
            </TableCell>
            <TableCell>
              <Badge className={getLevelColor(plan.plan?.request?.level)}>
                {plan.plan?.request?.level || 'N/A'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(plan.status)}>
                {plan.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://gym.condamind.com/plans/${plan.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default WorkoutPlans;