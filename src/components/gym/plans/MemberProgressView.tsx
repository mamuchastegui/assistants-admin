import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Activity,
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  TrendingUp,
  Trophy,
  User,
  Weight,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useWorkoutPlans } from '@/hooks/gym/useWorkoutPlans';
import { cn } from '@/lib/utils';

interface Member {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  workout_plan_id?: string;
  workout_plan_name?: string;
  membership_status: string;
  last_check_in?: string;
  total_checkins?: number;
}

interface MemberProgressViewProps {
  members: Member[];
}

export const MemberProgressView: React.FC<MemberProgressViewProps> = ({ members }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const membersWithPlans = members.filter(m => m.workout_plan_id);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersWithPlans.length}</div>
            <p className="text-xs text-muted-foreground">Con plan asignado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Adherencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Promedio semanal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progreso de Miembros</CardTitle>
          <CardDescription>
            Seguimiento del progreso y adherencia de cada miembro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Plan Actual</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Adherencia</TableHead>
                <TableHead>Último Check-in</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersWithPlans.map((member) => (
                <MemberRow
                  key={member.member_id}
                  member={member}
                  onViewDetails={(member) => {
                    setSelectedMember(member);
                    setShowDetailsDialog(true);
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedMember && (
        <MemberProgressDialog
          member={selectedMember}
          open={showDetailsDialog}
          onClose={() => {
            setShowDetailsDialog(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
};

const MemberRow: React.FC<{
  member: Member;
  onViewDetails: (member: Member) => void;
}> = ({ member, onViewDetails }) => {
  const {
    useMemberActivePlan,
    useMemberHistory,
    useWorkoutStats
  } = useWorkoutPlans();

  const { data: activePlan } = useMemberActivePlan(member.member_id);
  const { data: history = [] } = useMemberHistory(
    member.member_id,
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const { data: stats } = useWorkoutStats(7);

  // Calculate adherence (sessions completed vs scheduled)
  const scheduledSessions = activePlan?.sessions_per_week || 0;
  const completedThisWeek = history.filter(session => {
    const sessionDate = new Date(session.completed_date!);
    const weekStart = startOfWeek(new Date(), { locale: es });
    const weekEnd = endOfWeek(new Date(), { locale: es });
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  }).length;

  const adherence = scheduledSessions > 0
    ? Math.round((completedThisWeek / scheduledSessions) * 100)
    : 0;

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = () => {
    if (!member.last_check_in) {
      return <Badge variant="outline">Inactivo</Badge>;
    }

    const lastCheckIn = new Date(member.last_check_in);
    const daysSinceLastCheckIn = Math.floor(
      (Date.now() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastCheckIn === 0) {
      return <Badge className="bg-green-100 text-green-700">Hoy</Badge>;
    } else if (daysSinceLastCheckIn <= 3) {
      return <Badge className="bg-yellow-100 text-yellow-700">Activo</Badge>;
    } else if (daysSinceLastCheckIn <= 7) {
      return <Badge variant="outline">Irregular</Badge>;
    } else {
      return <Badge variant="destructive">Inactivo</Badge>;
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`/api/placeholder/32/32`} />
            <AvatarFallback>
              {member.first_name[0]}{member.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {member.first_name} {member.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{member.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{activePlan?.name || member.workout_plan_name}</p>
          {activePlan && (
            <p className="text-xs text-muted-foreground">
              Semana {activePlan.current_week} de {activePlan.duration_weeks}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {activePlan && (
          <div className="space-y-1">
            <Progress value={activePlan.completion_percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {activePlan.completed_sessions}/{activePlan.total_sessions} sesiones
            </p>
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className={cn("font-medium", getAdherenceColor(adherence))}>
          {adherence}%
        </div>
        <p className="text-xs text-muted-foreground">
          {completedThisWeek}/{scheduledSessions} esta semana
        </p>
      </TableCell>
      <TableCell>
        {member.last_check_in ? (
          <div>
            <p className="text-sm">
              {format(new Date(member.last_check_in), 'dd/MM', { locale: es })}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(member.last_check_in), 'HH:mm', { locale: es })}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Nunca</span>
        )}
      </TableCell>
      <TableCell>{getStatusBadge()}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(member)}
        >
          Ver detalles
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const MemberProgressDialog: React.FC<{
  member: Member;
  open: boolean;
  onClose: () => void;
}> = ({ member, open, onClose }) => {
  const {
    useMemberActivePlan,
    useMemberHistory,
    usePersonalRecords,
    useWorkoutStats,
    useExerciseHistory
  } = useWorkoutPlans();

  const { data: activePlan } = useMemberActivePlan(member.member_id);
  const { data: history = [] } = useMemberHistory(
    member.member_id,
    format(subDays(new Date(), 90), 'yyyy-MM-dd')
  );
  const { data: personalRecords = [] } = usePersonalRecords();
  const { data: stats } = useWorkoutStats(30);

  // Prepare data for charts
  const weeklyProgress = Array.from({ length: 12 }, (_, i) => {
    const weekStart = subDays(new Date(), (11 - i) * 7);
    const weekEnd = subDays(new Date(), (10 - i) * 7);
    const sessionsInWeek = history.filter(session => {
      const sessionDate = new Date(session.completed_date!);
      return sessionDate >= weekStart && sessionDate < weekEnd;
    });

    return {
      week: `S${i + 1}`,
      sesiones: sessionsInWeek.length,
      volumen: sessionsInWeek.reduce((sum, s) => sum + (s.total_weight_lifted || 0), 0),
    };
  });

  const muscleGroupProgress = [
    { muscle: 'Pecho', current: 85, previous: 70 },
    { muscle: 'Espalda', current: 78, previous: 65 },
    { muscle: 'Piernas', current: 92, previous: 80 },
    { muscle: 'Hombros', current: 70, previous: 60 },
    { muscle: 'Brazos', current: 88, previous: 75 },
    { muscle: 'Core', current: 65, previous: 55 },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Progreso de {member.first_name} {member.last_name}
          </DialogTitle>
          <DialogDescription>
            Análisis detallado del progreso y rendimiento del miembro
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="sessions">Sesiones</TabsTrigger>
            <TabsTrigger value="progress">Progreso</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Plan Info */}
            {activePlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plan Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">{activePlan.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activePlan.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso Total</span>
                        <span className="font-medium">
                          {Math.round(activePlan.completion_percentage)}%
                        </span>
                      </div>
                      <Progress value={activePlan.completion_percentage} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Semana {activePlan.current_week} de {activePlan.duration_weeks}</span>
                        <span>{activePlan.completed_sessions}/{activePlan.total_sessions} sesiones</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Racha Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7 días</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Mejor racha: 15 días
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Volumen Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total_weight_lifted || 0} kg
                  </div>
                  <p className="text-xs text-muted-foreground">Últimos 30 días</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">PRs Alcanzados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{personalRecords.length}</div>
                  <p className="text-xs text-muted-foreground">Records personales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tiempo Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.avg_workout_duration || 0} min
                  </div>
                  <p className="text-xs text-muted-foreground">Por sesión</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progreso Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sesiones" fill="#8884d8" name="Sesiones" />
                    <Bar yAxisId="right" dataKey="volumen" fill="#82ca9d" name="Volumen (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historial de Sesiones</CardTitle>
                <CardDescription>
                  Últimas sesiones completadas con detalles de rendimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Sesión</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Ejercicios</TableHead>
                      <TableHead>Volumen</TableHead>
                      <TableHead>Completado</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.slice(0, 10).map((session) => (
                      <TableRow key={session.session_id}>
                        <TableCell>
                          {format(new Date(session.completed_date!), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>{session.name}</TableCell>
                        <TableCell>{session.duration_minutes} min</TableCell>
                        <TableCell>{session.total_exercises}</TableCell>
                        <TableCell>{session.total_weight_lifted || 0} kg</TableCell>
                        <TableCell>
                          <Progress
                            value={session.completion_percentage}
                            className="h-2 w-20"
                          />
                        </TableCell>
                        <TableCell>
                          {session.rating && (
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Trophy
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < session.rating!
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {/* Muscle Group Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progreso por Grupo Muscular</CardTitle>
                <CardDescription>
                  Comparación del progreso actual vs. mes anterior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={muscleGroupProgress}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="muscle" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Mes Anterior"
                      dataKey="previous"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Actual"
                      dataKey="current"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Personal Records */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Records Personales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalRecords.slice(0, 5).map((record: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{record.exercise}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.achieved_date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{record.max_weight} kg</p>
                        {record.previous_record && (
                          <p className="text-xs text-green-600">
                            +{record.max_weight - record.previous_record} kg
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insights y Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Positive Insights */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Excelente consistencia
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Has mantenido una adherencia del 85% en las últimas 4 semanas.
                        Tu racha actual de 7 días muestra un gran compromiso.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Areas to Improve */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Área de mejora: Tren superior
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        El progreso en ejercicios de espalda y hombros está por debajo del promedio.
                        Considera aumentar gradualmente la intensidad en estas áreas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-medium">Recomendaciones</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Aumentar volumen progresivamente</p>
                        <p className="text-xs text-muted-foreground">
                          Basado en tu progreso, puedes aumentar el volumen un 5-10% la próxima semana
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Optimizar tiempo de descanso</p>
                        <p className="text-xs text-muted-foreground">
                          Tus sesiones duran en promedio 75 minutos. Considera reducir tiempos de descanso
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Próximo objetivo</p>
                        <p className="text-xs text-muted-foreground">
                          Estás cerca de alcanzar 100kg en press de banca. ¡Sigue así!
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MemberProgressView;