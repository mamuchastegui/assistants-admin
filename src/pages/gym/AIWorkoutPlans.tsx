/**
 * Gym Plans Page - Manages AI-generated workout plans from gym.condamind.com
 * These plans have a different structure than the assistants-api workout plans
 */
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGymWorkoutPlans, GymWorkoutPlan, GymWorkoutDay } from '@/hooks/gym/useGymWorkoutPlans';
import { useGymTrainer } from '@/hooks/gym/useGymTrainer';
import TrainerRegistrationPrompt from '@/components/gym/TrainerRegistrationPrompt';

const AIWorkoutPlans: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<GymWorkoutPlan | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [planToAssign, setPlanToAssign] = useState<GymWorkoutPlan | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [viewTab, setViewTab] = useState<'all' | 'active' | 'archived'>('all');

  const { useTrainerProfile, useListClients } = useGymTrainer();
  const { data: trainerProfile, isLoading: loadingTrainer } = useTrainerProfile();
  const tenantId = trainerProfile?.tenant_id;

  const {
    usePlans,
    usePlan,
    useTrainerClientPlans,
    useUpdatePlan,
    useAssignPlan,
    useDuplicatePlan,
  } = useGymWorkoutPlans();

  // Queries
  const { data: plansData, isLoading: loadingPlans } = usePlans({
    tenantId,
    status: viewTab === 'all' ? undefined : viewTab,
  });

  const { data: clientsData } = useListClients();
  const clients = clientsData?.clients || [];

  // Mutations
  const updatePlan = useUpdatePlan();
  const assignPlan = useAssignPlan();
  const duplicatePlan = useDuplicatePlan();

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
  if (!trainerProfile) {
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
                  {clients.map((client: any) => (
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
    </div>
    </DashboardLayout>
  );
};

export default AIWorkoutPlans;
