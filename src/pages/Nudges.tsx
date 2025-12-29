import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CheckCircle,
  Sun,
  Moon,
  Send,
  Clock,
  AlertCircle,
  Search,
  Bug,
  RefreshCw,
} from "lucide-react";
import {
  useNudgeSystemStatus,
  useNudgeDeliveryStatus,
  useNudgeUserStatus,
  NudgeUserDeliveryResponse,
  NudgeRecord,
  SlotEligibility,
  EligibilityCheck,
} from "@/hooks/useNudges";

const statusColors: Record<string, string> = {
  sent: "bg-green-500/10 text-green-600 border-green-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  enqueued: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  retrying: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const statusIcons: Record<string, React.ReactNode> = {
  sent: <Send className="h-3 w-3" />,
  delivered: <CheckCircle className="h-3 w-3" />,
  pending: <Clock className="h-3 w-3" />,
  enqueued: <Clock className="h-3 w-3" />,
  failed: <AlertCircle className="h-3 w-3" />,
  retrying: <RefreshCw className="h-3 w-3" />,
};

function StatCard({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorClass = statusColors[status] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
  const icon = statusIcons[status] || null;

  return (
    <Badge variant="outline" className={`${colorClass} gap-1`}>
      {icon}
      {status}
    </Badge>
  );
}

function EligibilityCheckItem({ name, check }: { name: string; check: EligibilityCheck }) {
  const isPassing = check.status === "PASS";
  const isInfo = check.status === "INFO";

  return (
    <div className="flex items-center gap-2 text-sm">
      {isPassing ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : isInfo ? (
        <AlertCircle className="h-4 w-4 text-blue-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )}
      <span className={isPassing ? "text-green-600" : isInfo ? "text-blue-600" : "text-red-600"}>
        {name.replace(/_/g, " ")}
      </span>
      {check.value !== undefined && (
        <span className="text-muted-foreground text-xs">
          ({String(check.value)})
        </span>
      )}
      {check.note && (
        <span className="text-muted-foreground text-xs italic">
          - {check.note}
        </span>
      )}
    </div>
  );
}

function SlotEligibilityPanel({ slot, eligibility }: { slot: string; eligibility: SlotEligibility }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {slot === "morning" ? (
          <Sun className="h-4 w-4 text-yellow-500" />
        ) : (
          <Moon className="h-4 w-4 text-blue-500" />
        )}
        <span className="font-medium capitalize">{slot}</span>
        {eligibility.eligible ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
            Elegible
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 text-xs">
            No Elegible
          </Badge>
        )}
      </div>
      <div className="pl-6 space-y-1">
        {Object.entries(eligibility.checks).map(([name, check]) => (
          <EligibilityCheckItem key={name} name={name} check={check} />
        ))}
      </div>
      {eligibility.failed_checks.length > 0 && (
        <div className="pl-6 text-xs text-red-500">
          Fallos: {eligibility.failed_checks.join(", ")}
        </div>
      )}
    </div>
  );
}

function DebugPanel({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { data: userStatus, isLoading } = useNudgeUserStatus(userId);

  if (isLoading) {
    return (
      <Sheet open onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Debug: {userId}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const data = userStatus?.data;

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug: {userId}
          </SheetTitle>
        </SheetHeader>

        {data && (
          <div className="space-y-6 mt-6">
            {/* Preferencias */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                Preferencias
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  Morning:
                  {data.preferences.morning_enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-blue-500" />
                  Evening:
                  {data.preferences.evening_enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="col-span-2">
                  Timezone: <span className="font-mono text-xs">{data.preferences.timezone}</span>
                </div>
                <div className="col-span-2">
                  Consent:
                  {data.preferences.consent ? (
                    <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                  )}
                </div>
                {data.preferences.quiet_start && data.preferences.quiet_end && (
                  <div className="col-span-2 text-muted-foreground">
                    Quiet Hours: {data.preferences.quiet_start} - {data.preferences.quiet_end}
                  </div>
                )}
                {data.preferences.morning_time && (
                  <div className="text-muted-foreground">
                    Morning: {data.preferences.morning_time}
                  </div>
                )}
                {data.preferences.evening_time && (
                  <div className="text-muted-foreground">
                    Evening: {data.preferences.evening_time}
                  </div>
                )}
              </div>
            </div>

            {/* Info de Usuario */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                Info Usuario
              </h3>
              <div className="text-sm space-y-1">
                <div>
                  Telefono:
                  {data.user_info.has_phone ? (
                    <span className="ml-2 font-mono text-xs">
                      {data.user_info.phone_number || "Configurado"}
                    </span>
                  ) : (
                    <span className="ml-2 text-red-500">No configurado</span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  Hora local: {new Date(data.time_analysis.local_time).toLocaleTimeString()} ({data.time_analysis.timezone})
                </div>
              </div>
            </div>

            {/* Elegibilidad */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                Elegibilidad
              </h3>
              <div className="space-y-4">
                <SlotEligibilityPanel slot="morning" eligibility={data.eligibility.morning} />
                <SlotEligibilityPanel slot="evening" eligibility={data.eligibility.evening} />
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                Actividad Reciente
              </h3>
              <div className="text-sm space-y-1">
                <div>Total nudges: {data.recent_activity.total_nudges}</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.recent_activity.by_status).map(([status, count]) => (
                    count !== undefined && count > 0 && (
                      <Badge key={status} variant="outline" className="text-xs">
                        {status}: {count}
                      </Badge>
                    )
                  ))}
                </div>
                {data.recent_activity.last_nudge && (
                  <div className="text-muted-foreground mt-2">
                    Ultimo: {data.recent_activity.last_nudge.slot} -{" "}
                    <StatusBadge status={data.recent_activity.last_nudge.status} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function Nudges() {
  const [days, setDays] = useState(7);
  const [searchUserId, setSearchUserId] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [debugUserId, setDebugUserId] = useState<string | null>(null);

  const { data: systemStatus, isLoading: systemLoading, refetch: refetchSystem } = useNudgeSystemStatus(days);
  const { data: deliveryStatus, isLoading: deliveryLoading, refetch: refetchDelivery } = useNudgeDeliveryStatus({ days });

  const handleRefresh = () => {
    refetchSystem();
    refetchDelivery();
  };

  const systemStats = systemStatus?.data?.system_stats;
  const recentActivity = systemStatus?.data?.recent_activity;

  // Get nudges list from delivery status (user mode returns nudges array)
  const userDeliveryData = deliveryStatus?.data as NudgeUserDeliveryResponse["data"] | undefined;
  const nudgesList: NudgeRecord[] = userDeliveryData?.nudges || [];

  // Filter nudges
  const filteredNudges = nudgesList.filter((nudge) => {
    if (statusFilter !== "all" && nudge.status !== statusFilter) return false;
    if (slotFilter !== "all" && nudge.slot !== slotFilter) return false;
    if (searchUserId && !nudge.user_id.toLowerCase().includes(searchUserId.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Nudges Monitor</h1>
            <p className="text-muted-foreground text-sm">
              Monitoreo del sistema de notificaciones
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Dias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 dia</SelectItem>
                <SelectItem value="3">3 dias</SelectItem>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="14">14 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Usuarios"
            value={systemStats?.total_users_with_preferences || 0}
            icon={<Users className="h-5 w-5 text-primary" />}
            isLoading={systemLoading}
          />
          <StatCard
            title="Con Consentimiento"
            value={systemStats?.users_with_consent || 0}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            isLoading={systemLoading}
          />
          <StatCard
            title="Morning Enabled"
            value={systemStats?.morning_enabled_count || 0}
            icon={<Sun className="h-5 w-5 text-yellow-500" />}
            isLoading={systemLoading}
          />
          <StatCard
            title="Evening Enabled"
            value={systemStats?.evening_enabled_count || 0}
            icon={<Moon className="h-5 w-5 text-blue-500" />}
            isLoading={systemLoading}
          />
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Nudges"
            value={recentActivity?.total_nudges || 0}
            icon={<Send className="h-5 w-5 text-primary" />}
            isLoading={systemLoading}
          />
          <StatCard
            title="Enviados"
            value={recentActivity?.by_status?.sent || 0}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            isLoading={systemLoading}
          />
          <StatCard
            title="Pendientes"
            value={(recentActivity?.by_status?.pending || 0) + (recentActivity?.by_status?.enqueued || 0)}
            icon={<Clock className="h-5 w-5 text-yellow-500" />}
            isLoading={systemLoading}
          />
          <StatCard
            title="Fallidos"
            value={recentActivity?.by_status?.failed || 0}
            icon={<AlertCircle className="h-5 w-5 text-red-500" />}
            isLoading={systemLoading}
          />
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nudges Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por user_id..."
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="enqueued">Enqueued</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={slotFilter} onValueChange={setSlotFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {deliveryLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredNudges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay nudges para mostrar
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Slot</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNudges.map((nudge) => (
                      <TableRow key={nudge.id}>
                        <TableCell className="font-mono text-xs">
                          {nudge.user_id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {nudge.slot === "morning" ? (
                              <Sun className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Moon className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="capitalize">{nudge.slot}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {nudge.local_date || nudge.created_at?.split("T")[0] || "-"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={nudge.status} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDebugUserId(nudge.user_id)}
                          >
                            <Bug className="h-4 w-4 mr-1" />
                            Debug
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Panel */}
        {debugUserId && (
          <DebugPanel userId={debugUserId} onClose={() => setDebugUserId(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
