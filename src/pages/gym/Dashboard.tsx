import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Activity,
  UserCheck,
  AlertTriangle,
  Clock,
  Target,
  Award,
  BarChart
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useGymMembers } from '@/hooks/gym/useGymMembers';
import { useGymPayments } from '@/hooks/gym/useGymPayments';
import { useGymPlans } from '@/hooks/gym/useGymPlans';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Colors for charts
const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#8b5cf6',
  success: '#22c55e',
  muted: '#64748b'
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'members' | 'revenue' | 'attendance'>('members');

  // Hooks
  const { useListMembers, useExpiringMemberships } = useGymMembers();
  const { useListPayments, usePaymentsByPeriod } = useGymPayments();
  const { useListPlans, usePopularPlans } = useGymPlans();

  // Fetch data
  const { data: members } = useListMembers({ limit: 1000 });
  const { data: expiringMembers } = useExpiringMemberships(7);
  const { data: payments } = usePaymentsByPeriod('month');
  const { data: plans } = useListPlans({ is_active: true });
  const { data: popularPlans } = usePopularPlans(5);

  // Calculate stats
  const totalMembers = members?.total || 0;
  const activeMembers = members?.items?.filter(m => m.status === 'active').length || 0;
  const newMembersThisMonth = members?.items?.filter(m => {
    if (!m.join_date) return false;
    const joinDate = new Date(m.join_date);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const monthlyRevenue = payments?.reduce((sum, p) => {
    if (p.status === 'completed') return sum + (p.amount || 0);
    return sum;
  }, 0) || 0;

  const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;

  // Member status distribution
  const memberStatusData = [
    { name: 'Active', value: activeMembers, color: COLORS.success },
    { name: 'Inactive', value: members?.items?.filter(m => m.status === 'inactive').length || 0, color: COLORS.muted },
    { name: 'Suspended', value: members?.items?.filter(m => m.status === 'suspended').length || 0, color: COLORS.danger },
    { name: 'Expired', value: members?.items?.filter(m => m.status === 'expired').length || 0, color: COLORS.warning }
  ];

  // Monthly revenue trend (mock data for now)
  const revenueData = [
    { month: 'Jan', revenue: 45000, members: 120 },
    { month: 'Feb', revenue: 52000, members: 135 },
    { month: 'Mar', revenue: 48000, members: 128 },
    { month: 'Apr', revenue: 61000, members: 142 },
    { month: 'May', revenue: 55000, members: 138 },
    { month: 'Jun', revenue: 67000, members: 155 }
  ];

  // Attendance by day of week (mock data)
  const attendanceData = [
    { day: 'Mon', morning: 45, afternoon: 62, evening: 78 },
    { day: 'Tue', morning: 52, afternoon: 68, evening: 82 },
    { day: 'Wed', morning: 48, afternoon: 65, evening: 80 },
    { day: 'Thu', morning: 50, afternoon: 70, evening: 85 },
    { day: 'Fri', morning: 42, afternoon: 58, evening: 72 },
    { day: 'Sat', morning: 65, afternoon: 45, evening: 30 },
    { day: 'Sun', morning: 55, afternoon: 35, evening: 20 }
  ];

  // Class popularity (mock data)
  const classPopularity = [
    { class: 'CrossFit', members: 45, capacity: 50 },
    { class: 'Yoga', members: 38, capacity: 40 },
    { class: 'Spinning', members: 42, capacity: 45 },
    { class: 'Zumba', members: 35, capacity: 40 },
    { class: 'Boxing', members: 28, capacity: 30 }
  ];

  // Peak hours (mock data)
  const peakHoursData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    occupancy: Math.sin((i - 6) * 0.3) * 50 + 50 + Math.random() * 20
  })).filter(d => d.occupancy > 0);

  // Retention rate calculation
  const retentionRate = 92; // Mock for now
  const churnRate = 8; // Mock for now

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard del Gimnasio</h1>
            <p className="text-muted-foreground">Vista general del rendimiento de tu negocio</p>
          </div>
          <div className="flex gap-2">
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mes</TabsTrigger>
                <TabsTrigger value="quarter">Trimestre</TabsTrigger>
                <TabsTrigger value="year">Año</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +{newMembersThisMonth} este mes
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers}</div>
              <Progress value={(activeMembers / totalMembers) * 100} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {((activeMembers / totalMembers) * 100).toFixed(0)}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${monthlyRevenue.toLocaleString('es-AR')}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />
                {pendingPayments} pagos pendientes
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Retención</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{retentionRate}%</div>
              <div className="flex items-center text-xs">
                <Badge variant="outline" className="text-xs">
                  Churn: {churnRate}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {expiringMembers && expiringMembers.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-base">Membresías por Vencer</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {expiringMembers.length} membresías vencerán en los próximos 7 días.
                Considera contactar a estos miembros para renovación.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ingresos</CardTitle>
              <CardDescription>Ingresos y miembros por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.primary}
                    name="Ingresos ($)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="members"
                    stroke={COLORS.secondary}
                    name="Miembros"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Member Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Estados</CardTitle>
              <CardDescription>Estado actual de los miembros</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={memberStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {memberStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Patrones de Asistencia</CardTitle>
            <CardDescription>Asistencia promedio por día y horario</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="morning" stackId="a" fill={COLORS.info} name="Mañana" />
                <Bar dataKey="afternoon" stackId="a" fill={COLORS.primary} name="Tarde" />
                <Bar dataKey="evening" stackId="a" fill={COLORS.secondary} name="Noche" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Horas Pico</CardTitle>
              <CardDescription>Ocupación por hora del día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Popular Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Clases Populares</CardTitle>
              <CardDescription>Top 5 clases por asistencia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classPopularity.map((cls, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">{cls.class}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(cls.members / cls.capacity) * 100} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">
                        {cls.members}/{cls.capacity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Planes Más Vendidos</CardTitle>
              <CardDescription>Distribución de membresías</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularPlans?.map((plan, index) => (
                  <div key={plan.plan_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      <span className="text-sm">{plan.name}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {plan.member_count || 0} miembros
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas y acciones recomendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Contactar miembros por vencer</span>
                </div>
                <Badge>{expiringMembers?.length || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Revisar pagos pendientes</span>
                </div>
                <Badge variant="destructive">{pendingPayments}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Generar reporte mensual</span>
                </div>
                <Badge variant="outline">Pendiente</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;