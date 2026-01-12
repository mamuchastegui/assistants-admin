import React, { useState, useCallback } from 'react';
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
  Users,
  Search,
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MemberForm } from '@/components/gym/MemberForm';
import { MemberSubscriptionCard } from '@/components/gym/MemberSubscriptionCard';
import { SubscriptionStatusBadge } from '@/components/gym/SubscriptionStatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { useGymMembers } from '@/hooks/gym/useGymMembers';
import { useGymSubscriptions, type GymSubscription } from '@/hooks/gym/useGymSubscriptions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'expired'>('all');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [draftFormData, setDraftFormData] = useState<any>(null);
  const [viewingMember, setViewingMember] = useState<any>(null);
  const { toast } = useToast();

  const {
    useListMembers,
    useExpiringMemberships,
    useCreateMember,
    useUpdateMember,
    useDeleteMember,
    useSuspendMembership,
    useReactivateMembership,
    useRecordCheckIn
  } = useGymMembers();

  const {
    useSubscriptionStats,
    usePastDueSubscriptions,
    useGetMemberActiveSubscription
  } = useGymSubscriptions();

  // Fetch members with filters
  const { data: membersData, isLoading, refetch } = useListMembers({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm,
    limit: 100,
    offset: 0
  });

  // Fetch expiring memberships
  const { data: expiringMembers } = useExpiringMemberships(7);

  // Fetch subscription stats
  const { data: subscriptionStats } = useSubscriptionStats();

  // Fetch past due subscriptions
  const { data: pastDueSubscriptions } = usePastDueSubscriptions();

  // Get active subscription for viewing member
  const { data: viewingMemberSubscription } = useGetMemberActiveSubscription(
    viewingMember?.member_id || ''
  );

  // Mutations
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const suspendMembership = useSuspendMembership();
  const reactivateMembership = useReactivateMembership();
  const recordCheckIn = useRecordCheckIn();

  const members = membersData?.members || [];
  const totalMembers = membersData?.total || 0;

  // Calculate stats
  const activeCount = members.filter((m: any) => m.status === 'active').length;
  const inactiveCount = members.filter((m: any) => m.status === 'inactive').length;
  const suspendedCount = members.filter((m: any) => m.status === 'suspended').length;
  const expiredCount = members.filter((m: any) => m.status === 'expired').length;

  const handleDelete = async () => {
    if (!selectedMember) return;

    try {
      await deleteMember.mutateAsync(selectedMember.member_id);
      toast({
        title: 'Miembro eliminado',
        description: 'El miembro ha sido eliminado exitosamente.',
      });
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el miembro.',
        variant: 'destructive',
      });
    }
  };

  const handleSuspend = async () => {
    if (!selectedMember) return;

    try {
      await suspendMembership.mutateAsync({
        memberId: selectedMember.member_id,
        reason: 'Suspensión manual desde el panel de administración'
      });
      toast({
        title: 'Membresía suspendida',
        description: 'La membresía ha sido suspendida exitosamente.',
      });
      setIsSuspendDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo suspender la membresía.',
        variant: 'destructive',
      });
    }
  };

  const handleReactivate = async (memberId: string) => {
    try {
      await reactivateMembership.mutateAsync(memberId);
      toast({
        title: 'Membresía reactivada',
        description: 'La membresía ha sido reactivada exitosamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo reactivar la membresía.',
        variant: 'destructive',
      });
    }
  };

  const handleCheckIn = async (memberId: string) => {
    try {
      await recordCheckIn.mutateAsync(memberId);
      toast({
        title: 'Check-in registrado',
        description: 'El check-in ha sido registrado exitosamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el check-in.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateMember = useCallback(async (data: any) => {
    try {
      await createMember.mutateAsync(data);
      toast({
        title: 'Miembro creado',
        description: 'El nuevo miembro ha sido registrado exitosamente.',
      });
      setShowMemberForm(false);
      setDraftFormData(null); // Clear draft on successful creation
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el miembro.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [createMember, toast, refetch]);

  const handleUpdateMember = useCallback(async (data: any) => {
    if (!editingMember) return;

    try {
      await updateMember.mutateAsync({
        memberId: editingMember.member_id,
        data
      });
      toast({
        title: 'Miembro actualizado',
        description: 'Los datos del miembro han sido actualizados exitosamente.',
      });
      setShowMemberForm(false);
      setEditingMember(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el miembro.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [editingMember, updateMember, toast, refetch]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Activo', icon: CheckCircle },
      inactive: { variant: 'secondary' as const, label: 'Inactivo', icon: XCircle },
      suspended: { variant: 'destructive' as const, label: 'Suspendido', icon: AlertCircle },
      expired: { variant: 'outline' as const, label: 'Vencido', icon: Clock },
      pending: { variant: 'secondary' as const, label: 'Pendiente', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return '-';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Miembros</h1>
            <p className="text-muted-foreground">Gestiona los miembros de tu gimnasio</p>
          </div>
          <Button
            onClick={() => {
              setEditingMember(null);
              setShowMemberForm(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Miembro
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              {expiringMembers && expiringMembers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {expiringMembers.length} por vencer
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((activeCount / totalMembers) * 100) || 0}% del total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{inactiveCount}</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Mora</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {subscriptionStats?.past_due || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {pastDueSubscriptions?.length || 0} con pago vencido
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Past Due Alert */}
        {pastDueSubscriptions && pastDueSubscriptions.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Suscripciones en Mora ({pastDueSubscriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600">
                Hay {pastDueSubscriptions.length} miembro(s) con pagos vencidos.
                Su acceso al gimnasio esta bloqueado hasta regularizar el pago.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Miembros</CardTitle>
            <CardDescription>
              Busca y filtra los miembros de tu gimnasio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Activos
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inactivos
                </Button>
                <Button
                  variant={statusFilter === 'expired' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('expired')}
                >
                  Vencidos
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Cargando miembros...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Check-ins</TableHead>
                      <TableHead>Último Check-in</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No se encontraron miembros
                        </TableCell>
                      </TableRow>
                    ) : (
                      members.map((member: any) => (
                        <TableRow key={member.member_id}>
                          <TableCell className="font-medium">
                            {member.full_name || `${member.first_name} ${member.last_name}`}
                          </TableCell>
                          <TableCell>{member.email || '-'}</TableCell>
                          <TableCell>{member.phone || '-'}</TableCell>
                          <TableCell>{getStatusBadge(member.status)}</TableCell>
                          <TableCell>
                            {member.membership_end_date ? (
                              <div className="flex flex-col">
                                <span>{formatDate(member.membership_end_date)}</span>
                                {member.days_until_expiration !== null && member.days_until_expiration <= 7 && (
                                  <span className="text-xs text-orange-500">
                                    {member.days_until_expiration === 0
                                      ? 'Vence hoy'
                                      : `${member.days_until_expiration} días`}
                                  </span>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{member.total_check_ins || 0}</TableCell>
                          <TableCell>{formatDateTime(member.last_check_in)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewingMember(member)}>
                                  Ver detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setEditingMember(member);
                                  setShowMemberForm(true);
                                }}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleCheckIn(member.member_id)}>
                                  Registrar Check-in
                                </DropdownMenuItem>
                                <DropdownMenuItem>Renovar membresía</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {member.status === 'suspended' ? (
                                  <DropdownMenuItem
                                    onClick={() => handleReactivate(member.member_id)}
                                    className="text-green-600"
                                  >
                                    Reactivar
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setIsSuspendDialogOpen(true);
                                    }}
                                    className="text-orange-600"
                                  >
                                    Suspender
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Estás seguro?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. El miembro {selectedMember?.full_name} será marcado como inactivo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspender Membresía</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas suspender la membresía de {selectedMember?.full_name}?
                Podrás reactivarla más tarde.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleSuspend}>
                Suspender
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Member Form Sheet */}
        <Sheet open={showMemberForm} onOpenChange={setShowMemberForm}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
              </SheetTitle>
              <SheetDescription>
                {editingMember
                  ? 'Actualiza la información del miembro'
                  : 'Completa el formulario para registrar un nuevo miembro'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <MemberForm
                member={editingMember}
                initialData={!editingMember ? draftFormData : undefined}
                onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
                onCancel={() => {
                  setShowMemberForm(false);
                  setEditingMember(null);
                  setDraftFormData(null); // Clear draft on explicit cancel
                }}
                onFormChange={!editingMember ? setDraftFormData : undefined}
                isLoading={createMember.isPending || updateMember.isPending}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Member Details Sheet */}
        <Sheet open={!!viewingMember} onOpenChange={(open) => !open && setViewingMember(null)}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Detalles del Miembro</SheetTitle>
              <SheetDescription>
                Informacion completa del miembro
              </SheetDescription>
            </SheetHeader>
            {viewingMember && (
              <div className="mt-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informacion Personal</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nombre</p>
                      <p className="font-medium">{viewingMember.full_name || `${viewingMember.first_name} ${viewingMember.last_name}`}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estado</p>
                      {getStatusBadge(viewingMember.status)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{viewingMember.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Telefono</p>
                      <p className="font-medium">{viewingMember.phone || '-'}</p>
                    </div>
                    {viewingMember.dni && (
                      <div>
                        <p className="text-muted-foreground">DNI</p>
                        <p className="font-medium">{viewingMember.dni}</p>
                      </div>
                    )}
                    {viewingMember.date_of_birth && (
                      <div>
                        <p className="text-muted-foreground">Fecha de Nacimiento</p>
                        <p className="font-medium">{formatDate(viewingMember.date_of_birth)}</p>
                      </div>
                    )}
                    {viewingMember.emergency_contact_name && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Contacto de Emergencia</p>
                        <p className="font-medium">
                          {viewingMember.emergency_contact_name}
                          {viewingMember.emergency_contact_phone && ` - ${viewingMember.emergency_contact_phone}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subscription Info */}
                <MemberSubscriptionCard
                  subscription={viewingMemberSubscription || null}
                  onRenew={() => {
                    toast({
                      title: 'Proximamente',
                      description: 'La funcionalidad de renovacion estara disponible pronto.',
                    });
                  }}
                />

                {/* Legacy Membership Info (for reference) */}
                {viewingMember.membership_start_date && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Membresia (Legacy)</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Plan</p>
                        <p className="font-medium">{viewingMember.plan_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fecha de Alta</p>
                        <p className="font-medium">{formatDate(viewingMember.join_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Inicio Membresia</p>
                        <p className="font-medium">{formatDate(viewingMember.membership_start_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Vencimiento</p>
                        <p className="font-medium">{formatDate(viewingMember.membership_end_date)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Check-in Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Actividad</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Check-ins</p>
                      <p className="font-medium">{viewingMember.total_check_ins || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ultimo Check-in</p>
                      <p className="font-medium">{formatDateTime(viewingMember.last_check_in)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Check-ins este Mes</p>
                      <p className="font-medium">{viewingMember.check_ins_this_month || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {viewingMember.notes && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notas</h3>
                    <p className="text-sm">{viewingMember.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewingMember(null);
                      setEditingMember(viewingMember);
                      setShowMemberForm(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button onClick={() => handleCheckIn(viewingMember.member_id)}>
                    Registrar Check-in
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default Members;