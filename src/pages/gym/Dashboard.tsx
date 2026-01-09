import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  TrendingUp,
  DollarSign,
  UserCheck,
  AlertTriangle,
  Clock,
  Construction
} from 'lucide-react';
import { useGymMembers } from '@/hooks/gym/useGymMembers';
import { useGymPayments } from '@/hooks/gym/useGymPayments';
import { useGymPlans } from '@/hooks/gym/useGymPlans';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  // Hooks
  const { useListMembers, useExpiringMemberships } = useGymMembers();
  const { useListPayments } = useGymPayments();
  const { usePopularPlans } = useGymPlans();

  // Calculate date range for current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  // Fetch data
  const { data: members, isLoading: membersLoading } = useListMembers({ limit: 1000 });
  const { data: expiringMembers } = useExpiringMemberships(7);
  const { data: paymentsData } = useListPayments({ from_date: firstDayOfMonth, to_date: lastDayOfMonth, limit: 1000 });
  const { data: popularPlans } = usePopularPlans(5);

  // Extract payments array from response
  const payments = paymentsData?.payments || paymentsData || [];

  // Calculate stats
  const totalMembers = members?.total || 0;
  const activeMembers = members?.items?.filter((m: any) => m.status === 'active').length || 0;
  const newMembersThisMonth = members?.items?.filter((m: any) => {
    if (!m.join_date) return false;
    const joinDate = new Date(m.join_date);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const monthlyRevenue = Array.isArray(payments) ? payments.reduce((sum: number, p: any) => {
    if (p.status === 'completed') return sum + (p.amount || 0);
    return sum;
  }, 0) : 0;

  const pendingPayments = Array.isArray(payments) ? payments.filter((p: any) => p.status === 'pending').length : 0;

  // Under construction placeholder component
  const UnderConstruction = ({ title }: { title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <Construction className="h-12 w-12 mb-4" />
          <p className="text-sm">En construccion</p>
          <p className="text-xs">Proximamente disponible</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard del Gimnasio</h1>
          <p className="text-muted-foreground">Vista general del rendimiento de tu negocio</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{membersLoading ? '...' : totalMembers}</div>
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
              <div className="text-2xl font-bold">{membersLoading ? '...' : activeMembers}</div>
              <Progress value={totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(0) : 0}% del total
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
              <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringMembers?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Membresias proximas a vencer (7 dias)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {expiringMembers && expiringMembers.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-base">Membresias por Vencer</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {expiringMembers.length} membresias venceran en los proximos 7 dias.
                Considera contactar a estos miembros para renovacion.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Popular Plans - Real Data */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Planes Mas Vendidos</CardTitle>
              <CardDescription>Distribucion de membresias por plan</CardDescription>
            </CardHeader>
            <CardContent>
              {popularPlans && popularPlans.length > 0 ? (
                <div className="space-y-3">
                  {popularPlans.map((plan: any, index: number) => (
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
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay planes registrados
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rapidas</CardTitle>
              <CardDescription>Tareas pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Miembros por vencer</span>
                  </div>
                  <Badge>{expiringMembers?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Pagos pendientes</span>
                  </div>
                  <Badge variant="destructive">{pendingPayments}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Under Construction Sections */}
        <div className="grid gap-4 md:grid-cols-2">
          <UnderConstruction title="Tendencia de Ingresos" />
          <UnderConstruction title="Distribucion de Estados" />
        </div>

        <UnderConstruction title="Patrones de Asistencia" />

        <div className="grid gap-4 md:grid-cols-3">
          <UnderConstruction title="Horas Pico" />
          <UnderConstruction title="Clases Populares" />
          <UnderConstruction title="Tasa de Retencion" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
