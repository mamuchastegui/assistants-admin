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
  ExternalLink,
  AlertCircle,
  Loader2,
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
import { useAuth } from '@/hooks/useAuth';
import { gymConsoleClient } from '@/api/gymConsoleClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const TrainerSettings = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    businessName: '',
    specialty: '',
    bio: '',
    instagramHandle: '',
  });

  const { orgId } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { useTrainer } = useGymWorkoutPlans();
  const { data: trainer, isLoading, error } = useTrainer();

  // Debug info
  console.log('[TrainerSettings] orgId:', orgId, 'trainer:', trainer, 'isLoading:', isLoading, 'error:', error);

  // Mutation for registering trainer
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!orgId || !user?.email) throw new Error('Missing orgId or user email');

      // Generate random invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      return await gymConsoleClient.createOrSyncTrainer({
        tenantId: orgId,
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

  const isTrainer = !!trainer && !error;

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

  // No tenant selected
  if (!orgId) {
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
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tu token de Auth0 debe incluir un <code>org_id</code> o <code>tenant_id</code>.
                Contacta al administrador si crees que esto es un error.
              </p>
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
            <CardContent>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(error, null, 2)}
              </pre>
              <p className="mt-4 text-sm text-muted-foreground">
                TenantId: <code>{orgId}</code>
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
              <p><strong>Tenant ID:</strong> <code className="text-xs">{orgId}</code></p>
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-fit">
              <Users className="h-3 w-3 mr-1" />
              {trainer.activeClientCount} / {trainer.maxClients || 50} clientes
            </Badge>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://gym.condamind.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Abrir Gym App
              </a>
            </Button>
          </div>
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

        {/* Profile Card - Read Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Trainer
            </CardTitle>
            <CardDescription>
              Tu informacion profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrainerSettings;
