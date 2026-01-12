import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Copy,
  CheckCircle,
  Instagram,
  Globe,
  Users,
  QrCode,
  AlertCircle,
  Loader2,
  Pencil,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useGymWorkoutPlans } from '@/hooks/gym/useGymWorkoutPlans';
import { useTenant } from '@/context/TenantContext';
import { useTenantInfo } from '@/hooks/useTenantInfo';
import { useAuth } from '@/hooks/useAuth';
import { gymConsoleClient } from '@/api/gymConsoleClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const TrainerSettings = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    businessName: '',
    specialty: '',
    bio: '',
    instagramHandle: '',
  });
  const [editForm, setEditForm] = useState({
    businessName: '',
    specialty: '',
    bio: '',
    instagramHandle: '',
    website: '',
  });

  const { orgId } = useTenant();
  const { data: tenantInfo, isLoading: tenantLoading } = useTenantInfo();
  const tenantId = tenantInfo?.id; // UUID format (e.g., "2f686ec6-...")
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { useTrainer } = useGymWorkoutPlans();
  const { data: trainer, isLoading: trainerLoading, error } = useTrainer();

  const isLoading = tenantLoading || trainerLoading;

  // Debug info
  console.log('[TrainerSettings] orgId:', orgId, 'tenantId (UUID):', tenantId, 'trainer:', trainer, 'isLoading:', isLoading, 'error:', error);

  // Mutation for registering trainer
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId || !user?.email) throw new Error('Missing tenantId or user email');

      // Generate random invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      return await gymConsoleClient.createOrSyncTrainer({
        tenantId: tenantId,
        businessName: registerForm.businessName || undefined,
        specialty: registerForm.specialty || undefined,
        bio: registerForm.bio || undefined,
        inviteCode,
        userEmail: user.email,
        userName: user.name,
        instagramHandle: registerForm.instagramHandle || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Registro exitoso',
        description: 'Ahora eres un trainer registrado.',
      });
      setShowRegisterDialog(false);
      queryClient.invalidateQueries({ queryKey: ['gym', 'trainer'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al registrar',
        description: error.response?.data?.error || error.message || 'No se pudo completar el registro',
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating trainer profile
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId || !user?.email || !trainer) throw new Error('Missing data');

      return await gymConsoleClient.createOrSyncTrainer({
        tenantId: tenantId,
        businessName: editForm.businessName || undefined,
        specialty: editForm.specialty || undefined,
        bio: editForm.bio || undefined,
        inviteCode: trainer.inviteCode, // Keep the same invite code
        userEmail: user.email,
        userName: user.name,
        instagramHandle: editForm.instagramHandle || undefined,
        website: editForm.website || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios han sido guardados.',
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['gym', 'trainer'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar',
        description: error.response?.data?.error || error.message || 'No se pudo guardar los cambios',
        variant: 'destructive',
      });
    },
  });

  const isTrainer = !!trainer && !error;

  // Start editing with current values
  const startEditing = () => {
    if (trainer) {
      setEditForm({
        businessName: trainer.businessName || '',
        specialty: trainer.specialty || '',
        bio: trainer.bio || '',
        instagramHandle: trainer.instagramHandle || '',
        website: trainer.website || '',
      });
      setIsEditing(true);
    }
  };

  const copyInviteCode = () => {
    if (trainer?.inviteCode) {
      navigator.clipboard.writeText(trainer.inviteCode);
      setCopiedCode(true);
      toast({
        title: 'Codigo copiado',
        description: 'El codigo de invitacion ha sido copiado al portapapeles.',
      });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // No tenant selected (need both Auth0 org_id and mapped UUID tenant_id)
  if (!orgId || !tenantId) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Sin organizacion seleccionada
              </CardTitle>
              <CardDescription>
                No se detecta un tenant/organizacion asociado a tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Tu token de Auth0 debe incluir un <code>org_id</code> o <code>tenant_id</code>.
                Contacta al administrador si crees que esto es un error.
              </p>
              {orgId && (
                <p className="text-xs text-muted-foreground">
                  Auth0 org_id: <code>{orgId}</code> (no se pudo mapear a UUID)
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Error fetching trainer
  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error al cargar trainer
              </CardTitle>
              <CardDescription>
                No se pudo conectar con el gym app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(error, null, 2)}
              </pre>
              <p className="mt-4 text-sm text-muted-foreground">
                TenantId (UUID): <code>{tenantId}</code>
              </p>
              <p className="text-xs text-muted-foreground">
                Auth0 org_id: <code>{orgId}</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Not a trainer yet - show registration
  if (!isTrainer) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Conviertete en Trainer</h1>
            <p className="text-muted-foreground">
              Registrate como entrenador personal para gestionar clientes y asignar planes de entrenamiento.
            </p>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Informacion de cuenta</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Email:</strong> {user?.email || 'No disponible'}</p>
              <p><strong>Tenant ID:</strong> <code className="text-xs">{tenantId}</code></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Beneficios del Panel de Trainer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Codigo de invitacion unico para vincular clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Crear y asignar planes de entrenamiento personalizados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Ver el progreso y estadisticas de tus clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Acceso al catalogo de 2,200+ ejercicios con videos</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setShowRegisterDialog(true)}>
                Registrarme como Trainer
              </Button>
            </CardFooter>
          </Card>

          {/* Register Dialog */}
          <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registro de Trainer</DialogTitle>
                <DialogDescription>
                  Completa tu perfil de entrenador personal. Todos los campos son opcionales.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Nombre del negocio</Label>
                  <Input
                    id="businessName"
                    value={registerForm.businessName}
                    onChange={(e) => setRegisterForm({ ...registerForm, businessName: e.target.value })}
                    placeholder="Ej: FitCoach Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Input
                    id="specialty"
                    value={registerForm.specialty}
                    onChange={(e) => setRegisterForm({ ...registerForm, specialty: e.target.value })}
                    placeholder="Ej: Fuerza, CrossFit, Funcional..."
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={registerForm.bio}
                    onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
                    placeholder="Cuentanos sobre tu experiencia..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={registerForm.instagramHandle}
                    onChange={(e) => setRegisterForm({ ...registerForm, instagramHandle: e.target.value })}
                    placeholder="@tuusuario"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending}>
                  {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Completar Registro
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    );
  }

  // Trainer profile view
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuracion de Trainer</h1>
            <p className="text-muted-foreground">Tu perfil y codigo de invitacion</p>
          </div>
          <Badge variant="secondary" className="h-fit">
            <Users className="h-3 w-3 mr-1" />
            {trainer.activeClientCount} / {trainer.maxClients || 50} clientes
          </Badge>
        </div>

        {/* Invite Code Card */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Codigo de Invitacion
            </CardTitle>
            <CardDescription>
              Comparte este codigo con tus clientes para que se vinculen contigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-muted rounded-lg p-4 text-center">
                <span className="text-3xl font-mono font-bold tracking-wider">
                  {trainer.inviteCode}
                </span>
              </div>
              <Button
                variant={copiedCode ? 'default' : 'outline'}
                size="icon"
                onClick={copyInviteCode}
              >
                {copiedCode ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Los clientes ingresan este codigo en gym.condamind.com para vincularse
            </p>
          </CardFooter>
        </Card>

        {/* Profile Card - Editable */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Perfil de Trainer</CardTitle>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
            <CardDescription>
              {isEditing ? 'Modifica tu informacion profesional' : 'Tu informacion profesional'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              // Edit mode
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="editBusinessName">Nombre del negocio</Label>
                    <Input
                      id="editBusinessName"
                      value={editForm.businessName}
                      onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                      placeholder="Ej: FitCoach Pro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSpecialty">Especialidad</Label>
                    <Input
                      id="editSpecialty"
                      value={editForm.specialty}
                      onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                      placeholder="Ej: Fuerza, CrossFit..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editBio">Bio</Label>
                  <Textarea
                    id="editBio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Cuentanos sobre tu experiencia..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="editInstagram">Instagram</Label>
                    <Input
                      id="editInstagram"
                      value={editForm.instagramHandle}
                      onChange={(e) => setEditForm({ ...editForm, instagramHandle: e.target.value })}
                      placeholder="@tuusuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editWebsite">Sitio web</Label>
                    <Input
                      id="editWebsite"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar cambios
                  </Button>
                </div>
              </>
            ) : (
              // View mode
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre del negocio</p>
                    <p className="font-medium">{trainer.businessName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Especialidad</p>
                    <p className="font-medium">{trainer.specialty || '-'}</p>
                  </div>
                </div>

                {trainer.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="font-medium">{trainer.bio}</p>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {trainer.instagramHandle && (
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{trainer.instagramHandle}</span>
                    </div>
                  )}
                  {trainer.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={trainer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {trainer.website}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Limite de clientes</p>
                  <p className="font-medium">{trainer.maxClients || 50} clientes</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrainerSettings;
