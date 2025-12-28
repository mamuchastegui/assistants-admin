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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LogIn,
  LogOut,
  Users,
  Clock,
  Activity,
  TrendingUp,
  Search,
  QrCode,
  Smartphone,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGymCheckIns } from '@/hooks/gym/useGymCheckIns';
import { useGymMembers } from '@/hooks/gym/useGymMembers';
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
  Cell
} from 'recharts';

const CheckIns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showAutoCheckoutDialog, setShowAutoCheckoutDialog] = useState(false);

  const {
    useActiveCheckIns,
    useTodaySummary,
    usePeakHours,
    useCreateCheckIn,
    useCheckOut,
    useAutoCheckout,
    useQuickCheckIn
  } = useGymCheckIns();

  const { useListMembers } = useGymMembers();

  // Fetch data
  const { data: activeCheckIns, isLoading: loadingActive } = useActiveCheckIns();
  const { data: todaySummary } = useTodaySummary();
  const { data: peakHours } = usePeakHours(7);
  const { data: membersData } = useListMembers({ status: 'active', limit: 1000 });

  // Mutations
  const createCheckIn = useCreateCheckIn();
  const checkOut = useCheckOut();
  const autoCheckout = useAutoCheckout();
  const quickCheckIn = useQuickCheckIn();

  // Filter active check-ins by search
  const filteredCheckIns = activeCheckIns?.filter(c =>
    c.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.member_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Members not checked in
  const checkedInMemberIds = new Set(activeCheckIns?.map(c => c.member_id) || []);
  const availableMembers = membersData?.items?.filter(
    m => !checkedInMemberIds.has(m.member_id)
  ) || [];

  const handleQuickCheckIn = async () => {
    if (!selectedMember) return;

    try {
      await quickCheckIn.mutateAsync(selectedMember);
      setShowCheckInDialog(false);
      setSelectedMember('');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCheckOut = async (checkinId: string) => {
    try {
      await checkOut.mutateAsync(checkinId);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAutoCheckout = async () => {
    try {
      await autoCheckout.mutateAsync(12); // 12 hours default
      setShowAutoCheckoutDialog(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qr':
        return <QrCode className="h-4 w-4" />;
      case 'app':
      case 'whatsapp':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <LogIn className="h-4 w-4" />;
    }
  };

  // Format peak hours for chart
  const peakHoursChart = peakHours?.map(h => ({
    hour: `${h.hour}:00`,
    checkins: h.avg_per_day,
    members: h.unique_members
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Check-ins</h1>
            <p className="text-muted-foreground">Gestiona las entradas al gimnasio</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAutoCheckoutDialog(true)}
            >
              <Clock className="mr-2 h-4 w-4" />
              Auto Checkout
            </Button>
            <Button onClick={() => setShowCheckInDialog(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Nuevo Check-in
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins Hoy</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySummary?.total_checkins || 0}</div>
              <p className="text-xs text-muted-foreground">
                {todaySummary?.unique_members || 0} miembros únicos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actualmente en el Gym</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCheckIns?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                miembros activos ahora
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(todaySummary?.average_duration || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                tiempo de entrenamiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hora Pico</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {peakHours && peakHours[0] ? `${peakHours[0].hour}:00` : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                mayor actividad
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Peak Hours Chart */}
        {peakHoursChart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Horas Pico (Últimos 7 días)</CardTitle>
              <CardDescription>Promedio de check-ins por hora del día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={peakHoursChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="checkins" fill="#3b82f6" name="Check-ins promedio">
                    {peakHoursChart.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.checkins > 10 ? '#ef4444' : entry.checkins > 5 ? '#f59e0b' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Active Check-ins Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Miembros Actualmente en el Gym</CardTitle>
                <CardDescription>
                  {activeCheckIns?.length || 0} miembros entrenando ahora
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar miembro..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingActive ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredCheckIns && filteredCheckIns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Miembro</TableHead>
                    <TableHead>Hora de Entrada</TableHead>
                    <TableHead>Tiempo en el Gym</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCheckIns.map((checkin) => (
                    <TableRow key={checkin.checkin_id}>
                      <TableCell className="font-medium">
                        {checkin.member_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(checkin.check_in_time), 'HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatDistanceToNow(new Date(checkin.check_in_time), {
                            locale: es,
                            addSuffix: false
                          })}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getMethodIcon(checkin.check_in_method)}
                          <span className="text-sm capitalize">
                            {checkin.check_in_method}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckOut(checkin.checkin_id)}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Check Out
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No hay miembros en el gimnasio actualmente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Check-in Dialog */}
        <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Check-in</DialogTitle>
              <DialogDescription>
                Registra la entrada de un miembro al gimnasio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="member" className="text-sm font-medium">
                  Seleccionar Miembro
                </label>
                <select
                  id="member"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">Selecciona un miembro...</option>
                  {availableMembers.map((member) => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>
              {availableMembers.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Todos los miembros activos ya están en el gym</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleQuickCheckIn}
                disabled={!selectedMember || createCheckIn.isPending}
              >
                {createCheckIn.isPending ? 'Registrando...' : 'Registrar Check-in'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Auto Checkout Dialog */}
        <Dialog open={showAutoCheckoutDialog} onOpenChange={setShowAutoCheckoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Auto Checkout</DialogTitle>
              <DialogDescription>
                Esto realizará checkout automático de todos los miembros que ingresaron hace más de 12 horas
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Esta acción no se puede deshacer</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutoCheckoutDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleAutoCheckout}
                disabled={autoCheckout.isPending}
              >
                {autoCheckout.isPending ? 'Procesando...' : 'Ejecutar Auto Checkout'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CheckIns;