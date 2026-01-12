import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Dumbbell,
  Users,
  Activity,
  ExternalLink,
  Archive,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGymWorkoutPlans, type GymWorkoutPlan, type GymWorkoutDay, type GymExercise } from '@/hooks/gym/useGymWorkoutPlans';
import TrainerRegistrationPrompt from '@/components/gym/TrainerRegistrationPrompt';

const WorkoutPlans: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'all' | 'by-client'>('all');
  const [editingPlan, setEditingPlan] = useState<GymWorkoutPlan | null>(null);
  const [editForm, setEditForm] = useState<{
    programName: string;
    status: 'active' | 'completed' | 'archived' | '';
    weeklyPlan: Record<string, GymWorkoutDay>;
  }>({
    programName: '',
    status: '',
    weeklyPlan: {},
  });

  const { usePlans, useTrainerClientPlans, useTrainer, useUpdatePlan } = useGymWorkoutPlans();
  const updatePlanMutation = useUpdatePlan();

  // Check if user is a trainer (now queries gym app directly)
  const { data: trainer, isLoading: trainerLoading } = useTrainer();

  // Queries - get plans from gym app
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

  // Open edit dialog
  const openEditDialog = (plan: GymWorkoutPlan) => {
    setEditingPlan(plan);
    setEditForm({
      programName: plan.plan?.programName || '',
      status: plan.status,
      weeklyPlan: plan.plan?.weeklyPlan ? JSON.parse(JSON.stringify(plan.plan.weeklyPlan)) : {},
    });
  };

  // Update a specific exercise in a day
  const updateExercise = (dayKey: string, exerciseIndex: number, updates: Partial<GymExercise>) => {
    setEditForm(prev => ({
      ...prev,
      weeklyPlan: {
        ...prev.weeklyPlan,
        [dayKey]: {
          ...prev.weeklyPlan[dayKey],
          exercises: prev.weeklyPlan[dayKey].exercises.map((exercise, idx) =>
            idx === exerciseIndex ? { ...exercise, ...updates } : exercise
          ),
        },
      },
    }));
  };

  // Delete an exercise from a day
  const deleteExercise = (dayKey: string, exerciseIndex: number) => {
    setEditForm(prev => ({
      ...prev,
      weeklyPlan: {
        ...prev.weeklyPlan,
        [dayKey]: {
          ...prev.weeklyPlan[dayKey],
          exercises: prev.weeklyPlan[dayKey].exercises.filter((_, idx) => idx !== exerciseIndex),
        },
      },
    }));
  };

  // Add a new exercise to a day
  const addExercise = (dayKey: string) => {
    const newExercise: GymExercise = {
      name: '',
      sets: 3,
      reps: '10',
      restSeconds: 60,
      notes: '',
    };
    setEditForm(prev => ({
      ...prev,
      weeklyPlan: {
        ...prev.weeklyPlan,
        [dayKey]: {
          ...prev.weeklyPlan[dayKey],
          exercises: [...prev.weeklyPlan[dayKey].exercises, newExercise],
        },
      },
    }));
  };

  // Save plan changes
  const handleSavePlan = () => {
    if (!editingPlan) return;

    const updates: {
      plan?: { programName?: string; weeklyPlan?: Record<string, GymWorkoutDay> };
      status?: 'active' | 'completed' | 'archived';
    } = {};

    // Check for plan content changes
    const planChanges: { programName?: string; weeklyPlan?: Record<string, GymWorkoutDay> } = {};

    if (editForm.programName !== editingPlan.plan?.programName) {
      planChanges.programName = editForm.programName;
    }

    // Compare weeklyPlan (deep comparison via JSON)
    const originalWeeklyPlan = JSON.stringify(editingPlan.plan?.weeklyPlan || {});
    const newWeeklyPlan = JSON.stringify(editForm.weeklyPlan);
    if (originalWeeklyPlan !== newWeeklyPlan) {
      planChanges.weeklyPlan = editForm.weeklyPlan;
    }

    if (Object.keys(planChanges).length > 0) {
      updates.plan = planChanges;
    }

    if (editForm.status && editForm.status !== editingPlan.status) {
      updates.status = editForm.status;
    }

    if (Object.keys(updates).length === 0) {
      setEditingPlan(null);
      return;
    }

    updatePlanMutation.mutate(
      { planId: editingPlan.id, updates },
      {
        onSuccess: () => {
          setEditingPlan(null);
        },
      }
    );
  };

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
                  onEdit={openEditDialog}
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
                          onEdit={openEditDialog}
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

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plan</DialogTitle>
            <DialogDescription>
              Modifica el nombre, estado y ejercicios del plan de entrenamiento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="programName">Nombre del programa</Label>
                <Input
                  id="programName"
                  value={editForm.programName}
                  onChange={(e) => setEditForm({ ...editForm, programName: e.target.value })}
                  placeholder="Ej: Programa de fuerza 4 días"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value as 'active' | 'completed' | 'archived' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        Activo
                      </span>
                    </SelectItem>
                    <SelectItem value="completed">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        Completado
                      </span>
                    </SelectItem>
                    <SelectItem value="archived">
                      <span className="flex items-center gap-2">
                        <Archive className="h-4 w-4 text-red-600" />
                        Archivado
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingPlan && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <p><strong>Cliente:</strong> {editingPlan.user?.name || editingPlan.user?.email}</p>
                <p><strong>Creado:</strong> {editingPlan.createdAt ? format(new Date(editingPlan.createdAt), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</p>
              </div>
            )}

            {/* Days and Exercises Accordion */}
            {Object.keys(editForm.weeklyPlan).length > 0 && (
              <div className="space-y-2">
                <Label>Dias de entrenamiento</Label>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(editForm.weeklyPlan).map(([dayKey, day]) => (
                    <AccordionItem key={dayKey} value={dayKey}>
                      <AccordionTrigger className="text-sm">
                        <span className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4" />
                          {day.dayName || dayKey}
                          <Badge variant="outline" className="ml-2">
                            {day.exercises?.length || 0} ejercicios
                          </Badge>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {day.exercises?.map((exercise, exerciseIndex) => (
                            <div
                              key={exerciseIndex}
                              className="border rounded-lg p-3 space-y-3 bg-muted/30"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">
                                  Ejercicio {exerciseIndex + 1}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={() => deleteExercise(dayKey, exerciseIndex)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Input
                                  value={exercise.name}
                                  onChange={(e) => updateExercise(dayKey, exerciseIndex, { name: e.target.value })}
                                  placeholder="Nombre del ejercicio"
                                  className="font-medium"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Series</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={exercise.sets}
                                    onChange={(e) => updateExercise(dayKey, exerciseIndex, { sets: parseInt(e.target.value) || 1 })}
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Reps</Label>
                                  <Input
                                    value={exercise.reps}
                                    onChange={(e) => updateExercise(dayKey, exerciseIndex, { reps: e.target.value })}
                                    placeholder="8-12"
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Descanso (s)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={exercise.restSeconds || ''}
                                    onChange={(e) => updateExercise(dayKey, exerciseIndex, { restSeconds: parseInt(e.target.value) || undefined })}
                                    placeholder="60"
                                    className="h-8"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Notas</Label>
                                <Input
                                  value={exercise.notes || ''}
                                  onChange={(e) => updateExercise(dayKey, exerciseIndex, { notes: e.target.value })}
                                  placeholder="Notas del ejercicio..."
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => addExercise(dayKey)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar ejercicio
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlan} disabled={updatePlanMutation.isPending}>
              {updatePlanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Plans List Component - displays plans from personal-os-console
const PlansList: React.FC<{
  plans: GymWorkoutPlan[];
  getStatusColor: (status: string) => string;
  getLevelColor: (level?: string) => string;
  compact?: boolean;
  onEdit?: (plan: GymWorkoutPlan) => void;
}> = ({
  plans,
  getStatusColor,
  getLevelColor,
  compact = false,
  onEdit,
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
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(plan)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar plan
                    </DropdownMenuItem>
                  )}
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
                  {onEdit && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onEdit({ ...plan, status: 'archived' as const })}
                        className="text-red-600"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archivar plan
                      </DropdownMenuItem>
                    </>
                  )}
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