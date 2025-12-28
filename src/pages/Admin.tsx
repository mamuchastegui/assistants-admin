import React from "react";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStats } from "@/hooks/useAdminStats";
import {
  Users,
  Activity,
  Link2,
  MessageSquare,
  RefreshCw,
  Shield,
} from "lucide-react";

// Admin email whitelist - must match backend
const ADMIN_EMAILS = ["matias@condamind.com"];

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatCard = ({ title, value, description, icon, isLoading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Admin = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { stats, users, isLoadingStats, isLoadingUsers, refetch } = useAdminStats();

  // Check if user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  if (isAuthLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Redirect non-admins
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Admin Dashboard"
          description="Panel de administracion del sistema"
          icon={<Shield className="h-6 w-6" />}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Usuarios"
            value={stats?.total_users ?? 0}
            description="Usuarios registrados"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Activos (7 dias)"
            value={stats?.active_users_7d ?? 0}
            description="Con actividad reciente"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Linked PersonalOS"
            value={stats?.linked_personal_os ?? 0}
            description="Vinculados via WhatsApp"
            icon={<Link2 className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Mensajes (7 dias)"
            value={stats?.messages_7d ?? 0}
            description={`${stats?.messages_today ?? 0} hoy`}
            icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoadingStats}
          />
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email / User ID</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead>PersonalOS</TableHead>
                    <TableHead className="text-right">Threads</TableHead>
                    <TableHead>Ultima Actividad</TableHead>
                    <TableHead>Creado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No hay usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="font-medium">
                            {user.email || (
                              <span className="text-muted-foreground text-xs">
                                {user.user_id}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.phone_number ? (
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {user.phone_number}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_linked_personal_os ? (
                            <Badge variant="default" className="bg-green-600">
                              Linked
                            </Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.thread_count}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateTime(user.last_activity)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(user.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
