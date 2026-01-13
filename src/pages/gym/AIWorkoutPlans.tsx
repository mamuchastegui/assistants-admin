/**
 * Gym Plans Page - Manages AI-generated workout plans from gym.condamind.com
 * These plans have a different structure than the assistants-api workout plans
 */
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
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
  Copy,
  UserPlus,
  Edit,
  Archive,
  Dumbbell,
  Calendar,
  Users,
  Activity,
  ChevronRight,
  Clock,
  Target,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGymWorkoutPlans, type GymWorkoutPlan, type GymWorkoutDay, type GymExercise } from '@/hooks/gym/useGymWorkoutPlans';
import TrainerRegistrationPrompt from '@/components/gym/TrainerRegistrationPrompt';
import { ExerciseSelector } from '@/components/gym/ExerciseSelector';

const AIWorkoutPlans: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<GymWorkoutPlan | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [planToAssign, setPlanToAssign] = useState<GymWorkoutPlan | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [viewTab, setViewTab] = useState<'all' | 'active' | 'archived'>('all');
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

  const {
    useTrainer,
    useClients,
    usePlans,
    useUpdatePlan,
    useCreatePlan,
    useDeletePlan,
    useAssignPlan,
    useDuplicatePlan,
  } = useGymWorkoutPlans();

  // Get trainer from gym app
  const { data: trainer, isLoading: loadingTrainer } = useTrainer();

  // Queries
  const { data: plansData, isLoading: loadingPlans } = usePlans({
    status: viewTab === 'all' ? undefined : viewTab,
  });

  const { data: clientsData } = useClients(trainer?.id || '', 'active');
  const clients = clientsData?.clients || [];

  // Mutations
  const updatePlan = useUpdatePlan();
  const createPlan = useCreatePlan();
  const deletePlan = useDeletePlan();
  const assignPlan = useAssignPlan();
  const duplicatePlan = useDuplicatePlan();

  // Create plan state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<{
    clientId: string;
    programName: string;
    selectedDays: string[];
    weeklyPlan: Record<string, GymWorkoutDay>;
  }>({
    clientId: '',
    programName: '',
    selectedDays: [],
    weeklyPlan: {},
  });

  // Delete plan state
  const [planToDelete, setPlanToDelete] = useState<GymWorkoutPlan | null>(null);

  const plans = plansData?.plans || [];

  // Filter plans based on search
  const filteredPlans = plans.filter(plan => {
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

  const handleViewDetails = (plan: GymWorkoutPlan) => {
    setSelectedPlan(plan);
    setShowDetailsDialog(true);
  };

  const handleArchivePlan = async (planId: string) => {
    await updatePlan.mutateAsync({
      planId,
      updates: { status: 'archived' }
    });
  };

  const handleAssignPlan = (plan: GymWorkoutPlan) => {
    setPlanToAssign(plan);
    setShowAssignDialog(true);
  };

  const handleConfirmAssign = async () => {
    if (!planToAssign || !selectedClientId) return;

    await assignPlan.mutateAsync({
      planId: planToAssign.id,
      assignment: { clientUserId: selectedClientId }
    });

    setShowAssignDialog(false);
    setPlanToAssign(null);
    setSelectedClientId('');
  };

  const handleDuplicatePlan = async (planId: string, targetUserId?: string) => {
    await duplicatePlan.mutateAsync({
      planId,
      options: targetUserId ? { targetUserId } : undefined
    });
  };

  // Delete plan handlers
  const handleDeletePlan = (plan: GymWorkoutPlan) => {
    setPlanToDelete(plan);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    await deletePlan.mutateAsync(planToDelete.id);
    setPlanToDelete(null);
  };

  // Create plan handlers
  const DAYS_OF_WEEK = [
    { key: 'day1', label: 'Lunes' },
    { key: 'day2', label: 'Martes' },
    { key: 'day3', label: 'Miércoles' },
    { key: 'day4', label: 'Jueves' },
    { key: 'day5', label: 'Viernes' },
    { key: 'day6', label: 'Sábado' },
    { key: 'day7', label: 'Domingo' },
  ];

  const handleOpenCreateDialog = () => {
    setCreateForm({
      clientId: '',
      programName: '',
      selectedDays: [],
      weeklyPlan: {},
    });
    setShowCreateDialog(true);
  };

  const toggleDay = (dayKey: string, dayLabel: string) => {
    setCreateForm(prev => {
      const isSelected = prev.selectedDays.includes(dayKey);
      if (isSelected) {
        // Remove day
        const newSelectedDays = prev.selectedDays.filter(d => d !== dayKey);
        const newWeeklyPlan = { ...prev.weeklyPlan };
        delete newWeeklyPlan[dayKey];
        return { ...prev, selectedDays: newSelectedDays, weeklyPlan: newWeeklyPlan };
      } else {
        // Add day with empty exercises
        return {
          ...prev,
          selectedDays: [...prev.selectedDays, dayKey],
          weeklyPlan: {
            ...prev.weeklyPlan,
            [dayKey]: {
              dayName: dayLabel,
              muscleGroups: [],
              exercises: [],
            },
          },
        };
      }
    });
  };

  const addExerciseToNewPlan = (dayKey: string) => {
    const newExercise: GymExercise = {
      name: '',
      sets: 3,
      reps: '10',
      restSeconds: 60,
      notes: '',
    };
    setCreateForm(prev => ({
      ...prev,
      weeklyPlan: {
        ...prev.weeklyPlan,
        [dayKey]: {
          ...prev.weeklyPlan[dayKey],
          exercises: [...(prev.weeklyPlan[dayKey]?.exercises || []), newExercise],
        },
      },
    }));
  };

  const updateExerciseInNewPlan = (dayKey: string, exerciseIndex: number, updates: Partial<GymExercise>) => {
    setCreateForm(prev => ({
      ...prev,
      weeklyPlan: {
        ...prev.weeklyPlan,
        [dayKey]: {
          ...prev.weeklyPlan[dayKey],
          exercises: prev.weeklyPlan[dayKey].exercises.map((ex, idx) =>
            idx === exerciseIndex ? { ...ex, ...updates } : ex
          ),
        },
      },
    }));
  };

  const deleteExerciseFromNewPlan = (dayKey: string, exerciseIndex: number) => {
    setCreateForm(prev => ({
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

  const handleCreatePlan = async () => {
    if (!createForm.clientId || !createForm.programName) return;

    await createPlan.mutateAsync({
      userId: createForm.clientId,
      plan: {
        programName: createForm.programName,
        weeklyPlan: createForm.weeklyPlan,
      },
    });

    setShowCreateDialog(false);
  };

  // Edit plan handlers
  const handleEditPlan = (plan: GymWorkoutPlan) => {
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

  const handleSaveEdit = async () => {
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

    await updatePlan.mutateAsync(
      { planId: editingPlan.id, updates },
    );
    setEditingPlan(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Activo',
      completed: 'Completado',
      archived: 'Archivado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loadingPlans || loadingTrainer) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Show registration prompt if not a trainer
  if (!trainer) {
    return (
      <DashboardLayout>
        <TrainerRegistrationPrompt
          title="Accede a los Planes de IA"
          description="Registrate como trainer para ver y gestionar planes de entrenamiento generados por IA."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planes de Entrenamiento (IA)</h1>
          <p className="text-muted-foreground mt-1">
            Planes generados por IA para tus clientes
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes entrenando actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Planes</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
            <p className="text-xs text-muted-foreground">
              Generados por IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Clientes activos
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="archived">Archivados</TabsTrigger>
            </TabsList>

            <TabsContent value={viewTab} className="space-y-4 mt-4">
              {filteredPlans.length === 0 ? (
                <div className="text-center py-12">
                  <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">No hay planes disponibles</p>
                  <p className="text-muted-foreground">
                    Los planes se generan cuando los clientes inician su entrenamiento
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Días/Semana</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {plan.plan?.programName || 'Plan sin nombre'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {plan.plan?.weeklyPlan ? Object.keys(plan.plan.weeklyPlan).length : 0} días configurados
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.user?.name || 'Sin nombre'}</p>
                            <p className="text-sm text-muted-foreground">{plan.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {plan.plan?.weeklyPlan ? Object.keys(plan.plan.weeklyPlan).length : '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(plan.status)}>
                            {getStatusLabel(plan.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(plan.createdAt), 'dd MMM yyyy', { locale: es })}
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
                              <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar plan
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewDetails(plan)}>
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicatePlan(plan.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAssignPlan(plan)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Asignar a otro cliente
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {plan.status !== 'archived' && (
                                <DropdownMenuItem onClick={() => handleArchivePlan(plan.id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archivar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeletePlan(plan)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Plan Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan?.plan?.programName || 'Plan de Entrenamiento'}
            </DialogTitle>
            <DialogDescription>
              Cliente: {selectedPlan?.user?.name || selectedPlan?.user?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedPlan?.plan?.weeklyPlan && (
            <div className="space-y-4">
              <Accordion type="multiple" className="w-full">
                {Object.entries(selectedPlan.plan.weeklyPlan).map(([dayKey, day]) => (
                  <AccordionItem key={dayKey} value={dayKey}>
                    <AccordionTrigger>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">{day.dayName || dayKey}</span>
                        <div className="flex gap-1">
                          {day.muscleGroups?.map((mg, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {mg}
                            </Badge>
                          ))}
                        </div>
                        {day.estimatedDuration && (
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {day.estimatedDuration} min
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {day.warmup && day.warmup.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Calentamiento</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {day.warmup.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Ejercicios</h4>
                          <div className="space-y-2">
                            {day.exercises?.map((exercise, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                  <p className="font-medium">{exercise.name}</p>
                                  {exercise.notes && (
                                    <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                                  )}
                                </div>
                                <div className="text-right text-sm">
                                  <p className="font-medium">{exercise.sets} x {exercise.reps}</p>
                                  {exercise.restSeconds && (
                                    <p className="text-muted-foreground">
                                      Descanso: {exercise.restSeconds}s
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {day.notes && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">{day.notes}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {selectedPlan.plan.tips && selectedPlan.plan.tips.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Tips</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedPlan.plan.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Plan Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Plan a Cliente</DialogTitle>
            <DialogDescription>
              Selecciona el cliente al que deseas asignar este plan.
              El plan actual del cliente (si tiene uno) será archivado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.userId} value={client.userId}>
                      {client.name || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAssign}
              disabled={!selectedClientId || assignPlan.isPending}
            >
              {assignPlan.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Asignar Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Label htmlFor="editProgramName">Nombre del programa</Label>
                <Input
                  id="editProgramName"
                  value={editForm.programName}
                  onChange={(e) => setEditForm({ ...editForm, programName: e.target.value })}
                  placeholder="Ej: Programa de fuerza 4 días"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editStatus">Estado</Label>
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
                        <Target className="h-4 w-4 text-blue-600" />
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
                                <ExerciseSelector
                                  value={exercise.name}
                                  onChange={(name) => updateExercise(dayKey, exerciseIndex, { name })}
                                  placeholder="Buscar ejercicio..."
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
            <Button onClick={handleSaveEdit} disabled={updatePlan.isPending}>
              {updatePlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Plan</DialogTitle>
            <DialogDescription>
              Crea un plan de entrenamiento personalizado para un cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={createForm.clientId}
                onValueChange={(value) => setCreateForm(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.userId} value={client.userId}>
                      {client.name || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Program Name */}
            <div className="space-y-2">
              <Label>Nombre del programa</Label>
              <Input
                value={createForm.programName}
                onChange={(e) => setCreateForm(prev => ({ ...prev, programName: e.target.value }))}
                placeholder="Ej: Programa de fuerza 4 días"
              />
            </div>

            {/* Day Selection */}
            <div className="space-y-2">
              <Label>Días de entrenamiento</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(({ key, label }) => (
                  <Button
                    key={key}
                    type="button"
                    variant={createForm.selectedDays.includes(key) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDay(key, label)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Days Configuration */}
            {createForm.selectedDays.length > 0 && (
              <div className="space-y-2">
                <Label>Configurar ejercicios por día</Label>
                <Accordion type="single" collapsible className="w-full">
                  {createForm.selectedDays.map((dayKey) => {
                    const dayData = createForm.weeklyPlan[dayKey];
                    if (!dayData) return null;
                    return (
                      <AccordionItem key={dayKey} value={dayKey}>
                        <AccordionTrigger className="text-sm">
                          <span className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4" />
                            {dayData.dayName}
                            <Badge variant="outline" className="ml-2">
                              {dayData.exercises?.length || 0} ejercicios
                            </Badge>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {dayData.exercises?.map((exercise, exerciseIndex) => (
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
                                    onClick={() => deleteExerciseFromNewPlan(dayKey, exerciseIndex)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <ExerciseSelector
                                    value={exercise.name}
                                    onChange={(name) => updateExerciseInNewPlan(dayKey, exerciseIndex, { name })}
                                    placeholder="Buscar ejercicio..."
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Series</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={exercise.sets}
                                      onChange={(e) => updateExerciseInNewPlan(dayKey, exerciseIndex, { sets: parseInt(e.target.value) || 1 })}
                                      className="h-8"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Reps</Label>
                                    <Input
                                      value={exercise.reps}
                                      onChange={(e) => updateExerciseInNewPlan(dayKey, exerciseIndex, { reps: e.target.value })}
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
                                      onChange={(e) => updateExerciseInNewPlan(dayKey, exerciseIndex, { restSeconds: parseInt(e.target.value) || undefined })}
                                      placeholder="60"
                                      className="h-8"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs">Notas</Label>
                                  <Input
                                    value={exercise.notes || ''}
                                    onChange={(e) => updateExerciseInNewPlan(dayKey, exerciseIndex, { notes: e.target.value })}
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
                              onClick={() => addExerciseToNewPlan(dayKey)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Agregar ejercicio
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={!createForm.clientId || !createForm.programName || createPlan.isPending}
            >
              {createPlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Plan</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {planToDelete && (
            <div className="py-4 space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{planToDelete.plan?.programName || 'Plan sin nombre'}</p>
                <p className="text-sm text-muted-foreground">
                  Cliente: {planToDelete.user?.name || planToDelete.user?.email}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletePlan.isPending}
            >
              {deletePlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
};

export default AIWorkoutPlans;
