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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  UserPlus,
  Edit,
  Archive,
  Trash,
  Dumbbell,
  Calendar,
  TrendingUp,
  Users,
  FileTemplate,
  Activity,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useWorkoutPlans } from '@/hooks/gym/useWorkoutPlans';
import { useGymMembers } from '@/hooks/gym/useGymMembers';
import { useGymTrainer } from '@/hooks/gym/useGymTrainer';
import { PlanCreateDialog } from '@/components/gym/plans/PlanCreateDialog';
import { PlanDetailsDialog } from '@/components/gym/plans/PlanDetailsDialog';
import { PlanAssignDialog } from '@/components/gym/plans/PlanAssignDialog';
import { MemberProgressView } from '@/components/gym/plans/MemberProgressView';
import TrainerRegistrationPrompt from '@/components/gym/TrainerRegistrationPrompt';

const WorkoutPlans: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [planToAssign, setPlanToAssign] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'all' | 'templates' | 'active' | 'members'>('all');

  const {
    usePlans,
    useDeletePlan,
    useUpdatePlan,
    useDuplicatePlan,
    useWorkoutStats
  } = useWorkoutPlans();

  const { useMembers } = useGymMembers();
  const { useTrainerProfile } = useGymTrainer();

  // Check if user is a trainer
  const { data: trainer, isLoading: trainerLoading } = useTrainerProfile();

  // Queries
  const { data: allPlans = [], isLoading: loadingPlans } = usePlans();
  const { data: templates = [] } = usePlans({ is_template: true });
  const { data: activePlans = [] } = usePlans({ status: 'active' });
  const { data: members = [] } = useMembers();
  const { data: stats } = useWorkoutStats(30);

  // Mutations
  const deletePlan = useDeletePlan();
  const updatePlan = useUpdatePlan();
  const duplicatePlan = useDuplicatePlan();

  // Filter plans based on search
  const filteredPlans = allPlans.filter(plan => {
    const query = searchQuery.toLowerCase();
    return (
      plan.name.toLowerCase().includes(query) ||
      plan.description?.toLowerCase().includes(query) ||
      plan.member_name?.toLowerCase().includes(query) ||
      plan.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const getPlansForView = () => {
    switch (viewTab) {
      case 'templates':
        return templates;
      case 'active':
        return activePlans;
      case 'all':
      default:
        return filteredPlans;
    }
  };

  const handleDuplicatePlan = async (planId: string) => {
    const plan = allPlans.find(p => p.plan_id === planId);
    if (plan) {
      await duplicatePlan.mutateAsync({
        planId,
        newName: `${plan.name} (Copia)`,
      });
    }
  };

  const handleArchivePlan = async (planId: string) => {
    await updatePlan.mutateAsync({
      planId,
      updates: { status: 'archived' }
    });
  };

  const handleAssignPlan = (planId: string) => {
    setPlanToAssign(planId);
    setShowAssignDialog(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-orange-100 text-orange-700',
      expert: 'bg-red-100 text-red-700',
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      paused: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
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
            Gestiona planes de entrenamiento personalizados y plantillas
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans.length}</div>
            <p className="text-xs text-muted-foreground">
              {members.filter(m => m.workout_plan_id).length} miembros entrenando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantillas</CardTitle>
            <FileTemplate className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              Planes reutilizables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completamiento Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePlans.reduce((acc, p) => acc + p.completion_percentage, 0) / (activePlans.length || 1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              En planes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_workouts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 días
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
              <CardTitle>Gestión de Planes</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar planes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="templates">Plantillas</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="members">Por Miembro</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <PlansList
                plans={getPlansForView()}
                onViewDetails={setSelectedPlan}
                onDuplicate={handleDuplicatePlan}
                onArchive={handleArchivePlan}
                onAssign={handleAssignPlan}
                onDelete={(id) => deletePlan.mutate(id)}
                getDifficultyColor={getDifficultyColor}
                getStatusColor={getStatusColor}
              />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <PlansList
                plans={templates}
                onViewDetails={setSelectedPlan}
                onDuplicate={handleDuplicatePlan}
                onArchive={handleArchivePlan}
                onAssign={handleAssignPlan}
                onDelete={(id) => deletePlan.mutate(id)}
                getDifficultyColor={getDifficultyColor}
                getStatusColor={getStatusColor}
                isTemplateView
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <PlansList
                plans={activePlans}
                onViewDetails={setSelectedPlan}
                onDuplicate={handleDuplicatePlan}
                onArchive={handleArchivePlan}
                onAssign={handleAssignPlan}
                onDelete={(id) => deletePlan.mutate(id)}
                getDifficultyColor={getDifficultyColor}
                getStatusColor={getStatusColor}
              />
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <MemberProgressView members={members} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showCreateDialog && (
        <PlanCreateDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          members={members}
        />
      )}

      {selectedPlan && (
        <PlanDetailsDialog
          planId={selectedPlan}
          open={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      {showAssignDialog && planToAssign && (
        <PlanAssignDialog
          planId={planToAssign}
          open={showAssignDialog}
          onClose={() => {
            setShowAssignDialog(false);
            setPlanToAssign(null);
          }}
          members={members.filter(m => !m.workout_plan_id)}
        />
      )}
    </div>
  );
};

// Plans List Component
const PlansList: React.FC<{
  plans: any[];
  onViewDetails: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onAssign: (id: string) => void;
  onDelete: (id: string) => void;
  getDifficultyColor: (difficulty: string) => string;
  getStatusColor: (status: string) => string;
  isTemplateView?: boolean;
}> = ({
  plans,
  onViewDetails,
  onDuplicate,
  onArchive,
  onAssign,
  onDelete,
  getDifficultyColor,
  getStatusColor,
  isTemplateView = false
}) => {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold">No hay planes disponibles</p>
        <p className="text-muted-foreground">
          {isTemplateView
            ? 'Crea tu primera plantilla de entrenamiento'
            : 'Comienza creando un nuevo plan de entrenamiento'}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Miembro</TableHead>
          <TableHead>Duración</TableHead>
          <TableHead>Progreso</TableHead>
          <TableHead>Dificultad</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.plan_id}>
            <TableCell>
              <div>
                <p className="font-medium">{plan.name}</p>
                {plan.description && (
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              {plan.member_name || (plan.is_template ?
                <Badge variant="secondary">Plantilla</Badge> :
                <span className="text-muted-foreground">Sin asignar</span>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <p>{plan.duration_weeks} semanas</p>
                <p className="text-muted-foreground">
                  {plan.sessions_per_week}x/semana
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${plan.completion_percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(plan.completion_percentage)}%
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getDifficultyColor(plan.difficulty)}>
                {plan.difficulty}
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
                  <DropdownMenuItem onClick={() => onViewDetails(plan.plan_id)}>
                    Ver detalles
                  </DropdownMenuItem>
                  {!plan.member_id && (
                    <DropdownMenuItem onClick={() => onAssign(plan.plan_id)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Asignar a miembro
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onDuplicate(plan.plan_id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {plan.status !== 'archived' && (
                    <DropdownMenuItem onClick={() => onArchive(plan.plan_id)}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archivar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete(plan.plan_id)}
                    className="text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
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